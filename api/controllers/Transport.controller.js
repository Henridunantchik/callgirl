import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Transport from "../models/transport.model.js";
import User from "../models/user.model.js";
import Escort from "../models/escort.model.js";
import pesapalService from "../utils/pesapalService.js";
import { v4 as uuidv4 } from "uuid";

// Create transport request
const createTransportRequest = asyncHandler(async (req, res) => {
  const {
    escortId,
    city,
    pickupLocation,
    destinationLocation,
    paymentMethod,
    senderPhone,
  } = req.body;

  const userId = req.user._id;

  // Validate required fields
  if (
    !escortId ||
    !city ||
    !pickupLocation ||
    !destinationLocation ||
    !paymentMethod ||
    !senderPhone
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if escort exists
  const escort = await Escort.findById(escortId);
  if (!escort) {
    throw new ApiError(404, "Escort not found");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Create transport request
  const transport = new Transport({
    sender: userId,
    escort: escortId,
    city,
    pickupLocation,
    destinationLocation,
    paymentMethod,
    senderPhone,
  });

  // Calculate commissions and generate link
  transport.calculateCommissions();
  transport.generateTransportLink();

  await transport.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        transportId: transport._id,
        transportLink: transport.transportLink,
        amountBreakdown: {
          transportAmount: transport.transportAmount,
          platformCommission: transport.platformCommission,
          pesapalCommission: transport.pesapalCommission,
          totalAmount: transport.totalAmount,
          escortAmount: transport.escortAmount,
        },
        city: transport.city,
        status: transport.status,
      },
      "Transport request created successfully"
    )
  );
});

// Process transport payment
const processTransportPayment = asyncHandler(async (req, res) => {
  const { transportId } = req.params;
  const userId = req.user._id;

  // Find transport request
  const transport = await Transport.findById(transportId)
    .populate("escort", "firstName lastName phoneNumber")
    .populate("sender", "firstName lastName email");

  if (!transport) {
    throw new ApiError(404, "Transport request not found");
  }

  // Check if user is the sender
  if (transport.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only process your own transport requests");
  }

  // Check if already processed
  if (transport.status !== "pending") {
    throw new ApiError(400, "Transport request already processed");
  }

  try {
    // Generate unique order ID
    const orderId = `TRANSPORT_${Date.now()}_${uuidv4().substring(0, 8)}`;

    // Create PesaPal payment order
    const orderData = {
      orderId,
      amount: transport.totalAmount,
      description: `Transport money for ${transport.escort.firstName} ${transport.escort.lastName} - ${transport.city}`,
      type: "MERCHANT",
      firstName: transport.sender.firstName || "User",
      lastName: transport.sender.lastName || "Name",
      email: transport.sender.email,
      phoneNumber: transport.senderPhone,
      currency: transport.city === "Kampala" ? "UGX" : "USD",
    };

    const pesapalResponse = await pesapalService.createPaymentOrder(orderData);

    if (pesapalResponse.success) {
      // Update transport with PesaPal details
      transport.pesapalOrderId = orderId;
      transport.pesapalTrackingId = pesapalResponse.trackingId;
      transport.status = "processing";
      await transport.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            transportId: transport._id,
            redirectUrl: pesapalResponse.redirectUrl,
            orderId: orderId,
            amount: transport.totalAmount,
            currency: orderData.currency,
            status: transport.status,
          },
          "Transport payment initiated successfully"
        )
      );
    }
  } catch (error) {
    console.error("Transport payment error:", error);
    throw new ApiError(500, "Failed to process transport payment");
  }
});

// Get transport request by ID
const getTransportRequest = asyncHandler(async (req, res) => {
  const { transportId } = req.params;
  const userId = req.user._id;

  const transport = await Transport.findById(transportId)
    .populate("escort", "firstName lastName phoneNumber profileImage")
    .populate("sender", "firstName lastName email");

  if (!transport) {
    throw new ApiError(404, "Transport request not found");
  }

  // Check if user is authorized to view this transport
  if (
    transport.sender.toString() !== userId.toString() &&
    transport.escort._id.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Not authorized to view this transport request");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transport: {
          id: transport._id,
          transportLink: transport.transportLink,
          city: transport.city,
          pickupLocation: transport.pickupLocation,
          destinationLocation: transport.destinationLocation,
          amountBreakdown: {
            transportAmount: transport.transportAmount,
            platformCommission: transport.platformCommission,
            pesapalCommission: transport.pesapalCommission,
            totalAmount: transport.totalAmount,
            escortAmount: transport.escortAmount,
          },
          paymentMethod: transport.paymentMethod,
          senderPhone: transport.senderPhone,
          status: transport.status,
          sentAt: transport.sentAt,
          completedAt: transport.completedAt,
          escort: transport.escort,
          sender: transport.sender,
        },
      },
      "Transport request retrieved successfully"
    )
  );
});

// Get user's transport history
const getTransportHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const query = {
    $or: [{ sender: userId }, { escort: userId }],
  };

  if (status) {
    query.status = status;
  }

  const limitValue = parseInt(limit) || 10;
  const skip = (parseInt(page) - 1) * limitValue;

  const transports = await Transport.find(query)
    .populate("escort", "firstName lastName profileImage")
    .populate("sender", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(limitValue)
    .skip(skip);

  const total = await Transport.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transports: transports,
        pagination: {
          page: parseInt(page),
          limit: limitValue,
          totalPages: Math.ceil(total / limitValue),
          totalDocs: total,
        },
      },
      "Transport history retrieved successfully"
    )
  );
});

// Update transport status (for IPN)
const updateTransportStatus = asyncHandler(async (req, res) => {
  const { transportId } = req.params;
  const { status, pesapalTrackingId } = req.body;

  const transport = await Transport.findById(transportId);
  if (!transport) {
    throw new ApiError(404, "Transport request not found");
  }

  transport.status = status;
  if (pesapalTrackingId) {
    transport.pesapalTrackingId = pesapalTrackingId;
  }

  if (status === "completed") {
    transport.completedAt = new Date();
  }

  await transport.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { transport },
        "Transport status updated successfully"
      )
    );
});

// Get transport statistics
const getTransportStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Transport.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { escort: userId }],
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
      },
    },
  ]);

  const totalTransports = await Transport.countDocuments({
    $or: [{ sender: userId }, { escort: userId }],
  });

  const completedTransports = await Transport.countDocuments({
    $or: [{ sender: userId }, { escort: userId }],
    status: "completed",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats,
        summary: {
          totalTransports,
          completedTransports,
          completionRate:
            totalTransports > 0
              ? ((completedTransports / totalTransports) * 100).toFixed(2)
              : 0,
        },
      },
      "Transport statistics retrieved successfully"
    )
  );
});

export {
  createTransportRequest,
  processTransportPayment,
  getTransportRequest,
  getTransportHistory,
  updateTransportStatus,
  getTransportStats,
};
