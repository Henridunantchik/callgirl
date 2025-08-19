import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxLength: 300,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "lifestyle",
        "dating",
        "relationships",
        "travel",
        "fashion",
        "health",
        "tips",
        "news",
        "events",
      ],
      default: "lifestyle",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    readTime: {
      type: Number, // minutes
      default: 5,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: {
          type: String,
          required: true,
          maxLength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isApproved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    seo: {
      metaTitle: {
        type: String,
        maxLength: 60,
      },
      metaDescription: {
        type: String,
        maxLength: 160,
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ isFeatured: 1, publishedAt: -1 });
blogSchema.index({ title: "text", content: "text" });

// Middleware pour générer le slug automatiquement
blogSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();

  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");

  // Si le statut passe à published, définir publishedAt
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Méthode pour incrémenter les vues
blogSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Méthode pour incrémenter les likes
blogSchema.methods.incrementLikes = function () {
  this.likes += 1;
  return this.save();
};

// Méthode pour décrémenter les likes
blogSchema.methods.decrementLikes = function () {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

const Blog = mongoose.model("Blog", blogSchema);

export default Blog; 