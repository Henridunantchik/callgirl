import Payment from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import pesapalService from "../utils/pesapalService.js";
import { v4 as uuidv4 } from "uuid";

// Create payment intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const {
    amount,
    currency = "usd",
    bookingId,
    paymentMethod = "pesapal",
    type = "booking",
  } = req.body;
  const userId = req.user._id;

  if (!amount || !bookingId) {
    throw new ApiError(400, "Amount and booking ID are required");
  }

  // Generate unique order ID
  const orderId = `ORDER_${Date.now()}_${uuidv4().substring(0, 8)}`;

  try {
    if (paymentMethod === "pesapal") {
      // Create PesaPal payment order
      const orderData = {
        orderId,
        amount: parseFloat(amount),
        description: `Payment for ${type} - Order ${orderId}`,
        type: "MERCHANT",
        firstName: req.user.firstName || "User",
        lastName: req.user.lastName || "Name",
        email: req.user.email,
        phoneNumber: req.user.phoneNumber || "+1234567890",
        currency: currency.toUpperCase(),
      };

      const pesapalResponse = await pesapalService.createPaymentOrder(
        orderData
      );

      if (pesapalResponse.success) {
        // Save payment record
        const payment = await Payment.create({
          user: userId,
          type: type,
          amount: parseFloat(amount),
          currency: currency.toUpperCase(),
          status: "pending",
          paymentMethod: "pesapal",
          paymentGateway: "pesapal",
          transactionId: orderId,
          description: orderData.description,
          metadata: {
            bookingId,
            pesapalOrderId: orderId,
            redirectUrl: pesapalResponse.redirectUrl,
          },
        });

        return res.status(200).json(
          new ApiResponse(
            200,
            {
              paymentId: payment._id,
              orderId: orderId,
              redirectUrl: pesapalResponse.redirectUrl,
              amount: amount,
              currency: currency.toUpperCase(),
              status: "pending",
            },
            "PesaPal payment order created successfully"
          )
        );
      }
    } else {
      // Fallback to mock payment for other methods
      const paymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency,
        status: "requires_payment_method",
        client_secret: `pi_${Date.now()}_secret_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            paymentIntent,
            "Payment intent created successfully"
          )
        );
    }
  } catch (error) {
    console.error("Payment creation error:", error);
    throw new ApiError(500, "Failed to create payment order");
  }
});

// Confirm payment
const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user._id;

  try {
    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId,
    });

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    if (payment.paymentMethod === "pesapal") {
      // Check PesaPal payment status
      const statusResponse = await pesapalService.queryPaymentStatus(
        payment.transactionId
      );

      if (statusResponse.success) {
        // Update payment status based on PesaPal response
        const newStatus =
          statusResponse.status === "COMPLETED"
            ? "completed"
            : statusResponse.status === "FAILED"
            ? "failed"
            : "pending";

        payment.status = newStatus;
        payment.gatewayResponse = statusResponse;
        await payment.save();

        return res.status(200).json(
          new ApiResponse(
            200,
            {
              payment,
              status: newStatus,
              message: `Payment ${newStatus}`,
            },
            `Payment ${newStatus} successfully`
          )
        );
      }
    } else {
      // Mock payment confirmation for other methods
      payment.status = "completed";
      await payment.save();

      return res
        .status(200)
        .json(new ApiResponse(200, payment, "Payment confirmed successfully"));
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    throw new ApiError(500, "Failed to confirm payment");
  }
});

// Get payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const payments = await Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments({ user: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payments,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Payment history retrieved successfully"
    )
  );
});

// Get payment by ID
const getPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user._id;

  const payment = await Payment.findOne({
    _id: paymentId,
    user: userId,
  });

  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payment, "Payment retrieved successfully"));
});

// Request payout (for escorts)
const requestPayout = asyncHandler(async (req, res) => {
  const { amount, method } = req.body;
  const userId = req.user._id;

  if (!amount || !method) {
    throw new ApiError(400, "Amount and payment method are required");
  }

  const payout = await Payment.create({
    user: userId,
    amount: -amount, // Negative for payouts
    currency: "usd",
    status: "pending",
    type: "payout",
    method,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payout, "Payout request created successfully"));
});

// Get payout history
const getPayoutHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const payouts = await Payment.find({
    user: userId,
    type: "payout",
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Payment.countDocuments({
    user: userId,
    type: "payout",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        payouts,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Payout history retrieved successfully"
    )
  );
});

// PesaPal IPN (Instant Payment Notification) handler
const pesapalIPN = asyncHandler(async (req, res) => {
  const { pesapal_merchant_reference, pesapal_transaction_tracking_id } =
    req.query;

  if (!pesapal_merchant_reference || !pesapal_transaction_tracking_id) {
    throw new ApiError(400, "Missing required PesaPal parameters");
  }

  try {
    // Get payment status from PesaPal
    const statusResponse = await pesapalService.getTransactionStatus(
      pesapal_merchant_reference,
      pesapal_transaction_tracking_id
    );

    if (statusResponse.success) {
      // Find and update payment record
      const payment = await Payment.findOne({
        transactionId: pesapal_merchant_reference,
      });

      if (payment) {
        const newStatus =
          statusResponse.status === "COMPLETED"
            ? "completed"
            : statusResponse.status === "FAILED"
            ? "failed"
            : "pending";

        payment.status = newStatus;
        payment.gatewayResponse = statusResponse;
        await payment.save();

        console.log(
          `Payment ${pesapal_merchant_reference} updated to ${newStatus}`
        );
      }
    }

    // Return success response to PesaPal
    res.status(200).send("OK");
  } catch (error) {
    console.error("PesaPal IPN Error:", error);
    res.status(500).send("ERROR");
  }
});

// Check PesaPal payment status
const checkPesaPalStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  try {
    // Find payment record
    const payment = await Payment.findOne({
      transactionId: orderId,
      user: userId,
    });

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    // Query PesaPal for current status
    const statusResponse = await pesapalService.queryPaymentStatus(orderId);

    if (statusResponse.success) {
      // Update payment status
      const newStatus =
        statusResponse.status === "COMPLETED"
          ? "completed"
          : statusResponse.status === "FAILED"
          ? "failed"
          : "pending";

      payment.status = newStatus;
      payment.gatewayResponse = statusResponse;
      await payment.save();

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            payment,
            status: newStatus,
            trackingId: statusResponse.trackingId,
          },
          `Payment status: ${newStatus}`
        )
      );
    }

    throw new ApiError(500, "Failed to check payment status");
  } catch (error) {
    console.error("PesaPal status check error:", error);
    throw new ApiError(500, "Failed to check payment status");
  }
});

export {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPayment,
  requestPayout,
  getPayoutHistory,
  pesapalIPN,
  checkPesaPalStatus,
};
