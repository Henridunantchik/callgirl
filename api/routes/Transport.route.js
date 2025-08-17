import { Router } from "express";
import {
  createTransportRequest,
  processTransportPayment,
  getTransportRequest,
  getTransportHistory,
  updateTransportStatus,
  getTransportStats,
} from "../controllers/Transport.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const TransportRoute = Router();

// Apply authentication middleware to all routes
TransportRoute.use(authenticate);

// Create transport request
TransportRoute.post("/create", createTransportRequest);

// Process transport payment
TransportRoute.post("/:transportId/pay", processTransportPayment);

// Get transport request by ID
TransportRoute.get("/:transportId", getTransportRequest);

// Get transport history
TransportRoute.get("/history", getTransportHistory);

// Get transport statistics
TransportRoute.get("/stats", getTransportStats);

// Update transport status (for IPN)
TransportRoute.patch("/:transportId/status", updateTransportStatus);

export default TransportRoute;
