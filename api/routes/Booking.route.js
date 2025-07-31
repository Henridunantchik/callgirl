import express from "express";
import {
  createBooking,
  getBookingsByEscort,
  getBookingsByClient,
  updateBooking,
  cancelBooking,
  getBookingById,
  getAllBookings,
  confirmBooking,
  completeBooking,
} from "../controllers/Booking.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";

const BookingRoute = express.Router();

// Authenticated routes
BookingRoute.post("/create", authenticate, createBooking);
BookingRoute.get("/escort/:escortId", authenticate, getBookingsByEscort);
BookingRoute.get("/client/:clientId", authenticate, getBookingsByClient);
BookingRoute.get("/:id", authenticate, getBookingById);
BookingRoute.put("/update/:id", authenticate, updateBooking);
BookingRoute.put("/cancel/:id", authenticate, cancelBooking);
BookingRoute.put("/confirm/:id", authenticate, confirmBooking);
BookingRoute.put("/complete/:id", authenticate, completeBooking);

// Admin routes
BookingRoute.get("/admin/all", authenticate, onlyAdmin, getAllBookings);

export default BookingRoute;
