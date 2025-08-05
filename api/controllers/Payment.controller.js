import Payment from "../models/payment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create payment intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = "usd", bookingId } = req.body;
  const userId = req.user._id;

  if (!amount || !bookingId) {
    throw new ApiError(400, "Amount and booking ID are required");
  }

  // For now, return a mock payment intent
  const paymentIntent = {
    id: `pi_${Date.now()}`,
    amount,
    currency,
    status: "requires_payment_method",
    client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
  };

  return res.status(200).json(
    new ApiResponse(200, paymentIntent, "Payment intent created successfully")
  );
});

// Confirm payment
const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const userId = req.user._id;

  // Mock payment confirmation
  const payment = await Payment.create({
    user: userId,
    paymentId,
    amount: 100, // Mock amount
    currency: "usd",
    status: "succeeded",
    type: "booking",
  });

  return res.status(200).json(
    new ApiResponse(200, payment, "Payment confirmed successfully")
  );
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
    new ApiResponse(200, {
      payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Payment history retrieved successfully")
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

  return res.status(200).json(
    new ApiResponse(200, payment, "Payment retrieved successfully")
  );
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

  return res.status(201).json(
    new ApiResponse(201, payout, "Payout request created successfully")
  );
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
    new ApiResponse(200, {
      payouts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Payout history retrieved successfully")
  );
});

export {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPayment,
  requestPayout,
  getPayoutHistory,
}; 