import Booking from "../models/booking.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new booking
const createBooking = asyncHandler(async (req, res) => {
  const { escortId, date, time, duration, type, notes } = req.body;
  const userId = req.user._id;

  if (!escortId || !date || !time || !duration) {
    throw new ApiError(400, "Escort ID, date, time, and duration are required");
  }

  // Check if the time slot is available
  const existingBooking = await Booking.findOne({
    escort: escortId,
    date,
    time,
    status: { $in: ["confirmed", "pending"] },
  });

  if (existingBooking) {
    throw new ApiError(400, "This time slot is already booked");
  }

  const booking = await Booking.create({
    client: userId,
    escort: escortId,
    date,
    time,
    duration,
    type: type || "in-call",
    notes,
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate("client", "name alias")
    .populate("escort", "name alias");

  return res.status(201).json(
    new ApiResponse(201, populatedBooking, "Booking created successfully")
  );
});

// Get user's bookings
const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const skip = (page - 1) * limit;
  const filter = { client: userId };
  
  if (status) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate("escort", "name alias avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "User bookings retrieved successfully")
  );
});

// Get escort's bookings
const getEscortBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status } = req.query;

  const skip = (page - 1) * limit;
  const filter = { escort: userId };
  
  if (status) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate("client", "name alias avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Escort bookings retrieved successfully")
  );
});

// Get booking by ID
const getBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId)
    .populate("client", "name alias avatar")
    .populate("escort", "name alias avatar");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user has access to this booking
  if (booking.client._id.toString() !== userId.toString() && 
      booking.escort._id.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  return res.status(200).json(
    new ApiResponse(200, booking, "Booking retrieved successfully")
  );
});

// Update booking status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Only escort can update booking status
  if (booking.escort.toString() !== userId.toString()) {
    throw new ApiError(403, "Only escort can update booking status");
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true }
  ).populate("client", "name alias").populate("escort", "name alias");

  return res.status(200).json(
    new ApiResponse(200, updatedBooking, "Booking status updated successfully")
  );
});

// Cancel booking
const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user can cancel this booking
  if (booking.client.toString() !== userId.toString() && 
      booking.escort.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "cancelled" },
    { new: true }
  ).populate("client", "name alias").populate("escort", "name alias");

  return res.status(200).json(
    new ApiResponse(200, updatedBooking, "Booking cancelled successfully")
  );
});

// Get escort availability
const getAvailability = asyncHandler(async (req, res) => {
  const { escortId } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  const bookings = await Booking.find({
    escort: escortId,
    date,
    status: { $in: ["confirmed", "pending"] },
  });

  // Return available time slots (simplified logic)
  const availableSlots = [];
  const bookedTimes = bookings.map(booking => booking.time);

  // Generate time slots from 9 AM to 11 PM
  for (let hour = 9; hour <= 23; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    if (!bookedTimes.includes(time)) {
      availableSlots.push(time);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { availableSlots, bookedTimes }, "Availability retrieved successfully")
  );
});

export {
  createBooking,
  getUserBookings,
  getEscortBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getAvailability,
}; 