import express from "express";
import {
  createBooking,
  getUserBookings,
  getEscortBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getAvailability,
} from "../controllers/Booking.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const BookingRoute = express.Router();

// Authenticated routes
BookingRoute.post("/create", authenticate, createBooking);
BookingRoute.get("/user", authenticate, getUserBookings);
BookingRoute.get("/escort", authenticate, getEscortBookings);
BookingRoute.get("/:id", authenticate, getBooking);
BookingRoute.put("/status/:id", authenticate, updateBookingStatus);
BookingRoute.put("/cancel/:id", authenticate, cancelBooking);
BookingRoute.get("/availability/:escortId", authenticate, getAvailability);

export default BookingRoute;
