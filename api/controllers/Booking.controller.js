import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";

// Create a new booking
const createBooking = asyncHandler(async (req, res) => {
  const { escortId, date, duration, location, totalAmount, notes } = req.body;

  const clientId = req.user._id;

  // Validate required fields
  if (!escortId || !date || !duration || !location || !totalAmount) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if escort exists and is an escort
  const escort = await User.findById(escortId);
  if (!escort || escort.role !== "escort") {
    throw new ApiError(404, "Escort not found");
  }

  // Check if date is in the future
  const bookingDate = new Date(date);
  if (bookingDate <= new Date()) {
    throw new ApiError(400, "Booking date must be in the future");
  }

  // Check if client is not booking themselves
  if (clientId.toString() === escortId) {
    throw new ApiError(400, "You cannot book yourself");
  }

  // Create booking
  const booking = await Booking.create({
    client: clientId,
    escort: escortId,
    date: bookingDate,
    duration,
    location,
    totalAmount,
    notes,
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate("client", "name alias avatar")
    .populate("escort", "name alias avatar rates");

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedBooking, "Booking created successfully")
    );
});

// Get user's bookings (client or escort)
const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  const filter = {
    $or: [{ client: userId }, { escort: userId }],
  };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(filter)
    .populate("client", "name alias avatar")
    .populate("escort", "name alias avatar rates")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Bookings retrieved successfully"
    )
  );
});

// Get booking by ID
const getBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId)
    .populate("client", "name alias avatar")
    .populate("escort", "name alias avatar rates");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is authorized to view this booking
  if (
    booking.client._id.toString() !== userId.toString() &&
    booking.escort._id.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking retrieved successfully"));
});

// Update booking status (escort only)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status, notes } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is the escort
  if (booking.escort.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the escort can update booking status");
  }

  // Validate status transition
  const validTransitions = {
    pending: ["accepted", "rejected"],
    accepted: ["completed", "cancelled"],
    rejected: [],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[booking.status].includes(status)) {
    throw new ApiError(
      400,
      `Cannot change status from ${booking.status} to ${status}`
    );
  }

  // Update booking
  booking.status = status;
  if (notes) {
    booking.escortNotes = notes;
  }

  if (status === "completed") {
    booking.completedAt = new Date();
  } else if (status === "cancelled") {
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;
  }

  await booking.save();

  const updatedBooking = await Booking.findById(bookingId)
    .populate("client", "name alias avatar")
    .populate("escort", "name alias avatar rates");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedBooking,
        "Booking status updated successfully"
      )
    );
});

// Cancel booking (client or escort)
const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { reason } = req.body;
  const userId = req.user._id;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Check if user is authorized to cancel
  if (
    booking.client.toString() !== userId.toString() &&
    booking.escort.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  // Check if booking can be cancelled
  if (booking.status !== "pending" && booking.status !== "accepted") {
    throw new ApiError(400, "Booking cannot be cancelled");
  }

  // Update booking
  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancelledBy = userId;
  if (reason) {
    booking.cancellationReason = reason;
  }

  await booking.save();

  const updatedBooking = await Booking.findById(bookingId)
    .populate("client", "name alias avatar")
    .populate("escort", "name alias avatar rates");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedBooking, "Booking cancelled successfully")
    );
});

// Get escort availability
const getEscortAvailability = asyncHandler(async (req, res) => {
  const { escortId } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new ApiError(400, "Date is required");
  }

  const queryDate = new Date(date);
  const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

  // Get bookings for this escort on this date
  const bookings = await Booking.find({
    escort: escortId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["pending", "accepted"] },
  });

  // Calculate available time slots
  const bookedHours = bookings.reduce((total, booking) => {
    return total + booking.duration;
  }, 0);

  const availableHours = 24 - bookedHours;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        date: startOfDay,
        bookedHours,
        availableHours,
        bookings: bookings.map((b) => ({
          id: b._id,
          startTime: b.date,
          duration: b.duration,
          status: b.status,
        })),
      },
      "Availability retrieved successfully"
    )
  );
});

// Get escort's bookings (for escort dashboard)
const getEscortBookings = asyncHandler(async (req, res) => {
  const escortId = req.user._id;
  const { status, page = 1, limit = 10 } = req.query;

  // Verify user is an escort
  if (req.user.role !== "escort") {
    throw new ApiError(403, "Access denied - escort only");
  }

  const filter = { escort: escortId };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(filter)
    .populate("client", "name alias avatar phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Escort bookings retrieved successfully"
    )
  );
});

export {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getEscortAvailability,
  getEscortBookings,
};
