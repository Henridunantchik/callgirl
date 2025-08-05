import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPayment,
  requestPayout,
  getPayoutHistory,
} from "../controllers/Payment.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const PaymentRoute = express.Router();

// Authenticated routes
PaymentRoute.post("/create-intent", authenticate, createPaymentIntent);
PaymentRoute.post("/confirm/:paymentId", authenticate, confirmPayment);
PaymentRoute.get("/history", authenticate, getPaymentHistory);
PaymentRoute.get("/:id", authenticate, getPayment);
PaymentRoute.post("/payout", authenticate, requestPayout);
PaymentRoute.get("/payouts", authenticate, getPayoutHistory);

export default PaymentRoute;
