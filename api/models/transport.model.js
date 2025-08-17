import mongoose from "mongoose";

const transportSchema = new mongoose.Schema(
  {
    // User who is sending transport money
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Escort who will receive transport money
    escort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Escort",
      required: true,
    },
    
    // Transport details
    city: {
      type: String,
      required: true,
      enum: ["Kampala", "Nairobi", "Dar es Salaam", "Kigali", "Bujumbura", "Other"],
    },
    
    // Amount breakdown
    transportAmount: {
      type: Number,
      required: true,
      default: 20000, // Default for Kampala
    },
    
    // Commission breakdown
    platformCommission: {
      type: Number,
      required: true,
      default: 2000, // 10% of 20000
    },
    
    pesapalCommission: {
      type: Number,
      required: true,
      default: 600, // 3% of 20000
    },
    
    // Total amount user pays
    totalAmount: {
      type: Number,
      required: true,
      default: 22600, // 20000 + 2000 + 600
    },
    
    // Amount escort receives
    escortAmount: {
      type: Number,
      required: true,
      default: 17400, // 20000 - 2000 - 600
    },
    
    // Payment details
    paymentMethod: {
      type: String,
      enum: ["M-PESA", "AIRTEL", "MTN", "VISA", "MASTERCARD"],
      required: true,
    },
    
    senderPhone: {
      type: String,
      required: true,
    },
    
    // PesaPal transaction details
    pesapalOrderId: {
      type: String,
      unique: true,
    },
    
    pesapalTrackingId: {
      type: String,
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    
    // Transport link
    transportLink: {
      type: String,
      unique: true,
    },
    
    // Location details
    pickupLocation: {
      type: String,
      required: true,
    },
    
    destinationLocation: {
      type: String,
      required: true,
    },
    
    // Timestamps
    sentAt: {
      type: Date,
    },
    
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate transport link
transportSchema.methods.generateTransportLink = function () {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  this.transportLink = `${baseUrl}/transport/${this._id}`;
  return this.transportLink;
};

// Calculate commissions based on city
transportSchema.methods.calculateCommissions = function () {
  const cityRates = {
    Kampala: 20000,
    Nairobi: 1500, // KES
    "Dar es Salaam": 5000, // TZS
    Kigali: 2000, // RWF
    Bujumbura: 5000, // BIF
    Other: 20000,
  };
  
  this.transportAmount = cityRates[this.city] || 20000;
  this.platformCommission = Math.round(this.transportAmount * 0.10); // 10%
  this.pesapalCommission = Math.round(this.transportAmount * 0.03); // 3%
  this.totalAmount = this.transportAmount + this.platformCommission + this.pesapalCommission;
  this.escortAmount = this.transportAmount - this.platformCommission - this.pesapalCommission;
  
  return this;
};

// Pre-save middleware
transportSchema.pre("save", function (next) {
  if (this.isNew) {
    this.calculateCommissions();
    this.generateTransportLink();
  }
  next();
});

const Transport = mongoose.model("Transport", transportSchema);

export default Transport;
