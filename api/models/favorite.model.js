import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
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
    collection: {
      type: String,
      default: "default",
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    shareExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
favoriteSchema.index({ client: 1, escort: 1 }, { unique: true });
favoriteSchema.index({ client: 1, collection: 1 });
favoriteSchema.index({ escort: 1, createdAt: -1 });

const Favorite = mongoose.model("Favorite", favoriteSchema, "favorites");
export default Favorite;
