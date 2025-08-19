import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    escort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // heures
      required: true,
      min: 1,
      max: 24,
    },
    location: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      maxLength: 500,
    },
    clientNotes: {
      type: String,
      maxLength: 500,
    },
    escortNotes: {
      type: String,
      maxLength: 500,
    },
    cancellationReason: {
      type: String,
      maxLength: 200,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
bookingSchema.index({ client: 1, createdAt: -1 });
bookingSchema.index({ escort: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
