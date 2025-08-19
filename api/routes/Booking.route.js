import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getEscortAvailability,
} from "../controllers/Booking.controller.js";

const router = express.Router();

// ===== BOOKING ROUTES =====
router.post("/create", authenticate, createBooking);
router.get("/user", authenticate, getUserBookings);
router.get("/:bookingId", authenticate, getBooking);
router.put("/:bookingId/status", authenticate, updateBookingStatus);
router.put("/:bookingId/cancel", authenticate, cancelBooking);
router.get("/escort/:escortId/availability", getEscortAvailability);

export default router;
