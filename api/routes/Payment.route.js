import express from "express";
import {
  createPayment,
  getPaymentsByUser,
  getPaymentById,
  processPayment,
  refundPayment,
  getAllPayments,
  getPaymentStats,
  createSubscription,
  cancelSubscription,
} from "../controllers/Payment.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";

const PaymentRoute = express.Router();

// Authenticated routes
PaymentRoute.post("/create", authenticate, createPayment);
PaymentRoute.get("/user/:userId", authenticate, getPaymentsByUser);
PaymentRoute.get("/:id", authenticate, getPaymentById);
PaymentRoute.post("/process/:id", authenticate, processPayment);
PaymentRoute.post("/refund/:id", authenticate, refundPayment);
PaymentRoute.post("/subscription", authenticate, createSubscription);
PaymentRoute.delete("/subscription/:id", authenticate, cancelSubscription);

// Admin routes
PaymentRoute.get("/admin/all", authenticate, onlyAdmin, getAllPayments);
PaymentRoute.get("/admin/stats", authenticate, onlyAdmin, getPaymentStats);

export default PaymentRoute;
