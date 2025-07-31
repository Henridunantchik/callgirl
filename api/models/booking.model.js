import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    escort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["hourly", "halfDay", "overnight", "weekend", "travel"],
      required: true,
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String, // HH:MM format
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["incall", "outcall"],
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "crypto", "mobile_money", "bank_transfer"],
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
      enum: ["escort", "client", "admin"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    notes: {
      escort: {
        type: String,
        trim: true,
      },
      client: {
        type: String,
        trim: true,
      },
      admin: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
bookingSchema.index({ escort: 1, status: 1, scheduledDate: 1 });
bookingSchema.index({ client: 1, status: 1, scheduledDate: 1 });
bookingSchema.index({ status: 1, scheduledDate: 1 });

const Booking = mongoose.model("Booking", bookingSchema, "bookings");
export default Booking;
