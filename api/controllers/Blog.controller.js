import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";

// Create a new blog post
const createBlog = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    excerpt,
    featuredImage,
    category,
    tags,
    status,
    readTime,
    seo,
  } = req.body;

  const authorId = req.user._id;

  // Validate required fields
  if (!title || !content || !featuredImage) {
    throw new ApiError(400, "Title, content, and featured image are required");
  }

  // Check if user is admin or escort (only they can create blogs)
  const user = await User.findById(authorId);
  if (!user || (user.role !== "admin" && user.role !== "escort")) {
    throw new ApiError(403, "Only admins and escorts can create blog posts");
  }

  // Create blog post
  const blog = await Blog.create({
    title,
    content,
    excerpt,
    featuredImage,
    author: authorId,
    category,
    tags,
    status,
    readTime,
    seo,
  });

  const populatedBlog = await Blog.findById(blog._id)
    .populate("author", "name alias avatar");

  return res.status(201).json(
    new ApiResponse(201, populatedBlog, "Blog post created successfully")
  );
});

// Get all published blog posts
const getAllBlogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    tag,
    search,
    sortBy = "publishedAt",
    sortOrder = "desc",
  } = req.query;

  const filter = { status: "published" };

  // Add category filter
  if (category) {
    filter.category = category;
  }

  // Add tag filter
  if (tag) {
    filter.tags = { $in: [tag] };
  }

  // Add search filter
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const blogs = await Blog.find(filter)
    .populate("author", "name alias avatar")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Blog.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      blogs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "Blog posts retrieved successfully")
  );
});

// Get featured blog posts
const getFeaturedBlogs = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const blogs = await Blog.find({
    status: "published",
    isFeatured: true,
  })
    .populate("author", "name alias avatar")
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, blogs, "Featured blog posts retrieved successfully")
  );
});

// Get blog post by slug
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, status: "published" })
    .populate("author", "name alias avatar")
    .populate("comments.user", "name alias avatar");

  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  // Increment views
  await blog.incrementViews();

  return res.status(200).json(
    new ApiResponse(200, blog, "Blog post retrieved successfully")
  );
});

// Get blog post by ID (for editing)
const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  const blog = await Blog.findById(blogId)
    .populate("author", "name alias avatar");

  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  // Check if user is authorized to view this blog
  const user = await User.findById(userId);
  if (
    blog.author._id.toString() !== userId.toString() &&
    user.role !== "admin"
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res.status(200).json(
    new ApiResponse(200, blog, "Blog post retrieved successfully")
  );
});

// Update blog post
const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  // Check if user is authorized to update this blog
  const user = await User.findById(userId);
  if (
    blog.author.toString() !== userId.toString() &&
    user.role !== "admin"
  ) {
    throw new ApiError(403, "Access denied");
  }

  // Update blog
  const updatedBlog = await Blog.findByIdAndUpdate(
    blogId,
    updateData,
    { new: true }
  ).populate("author", "name alias avatar");

  return res.status(200).json(
    new ApiResponse(200, updatedBlog, "Blog post updated successfully")
  );
});

// Delete blog post
const deleteBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  // Check if user is authorized to delete this blog
  const user = await User.findById(userId);
  if (
    blog.author.toString() !== userId.toString() &&
    user.role !== "admin"
  ) {
    throw new ApiError(403, "Access denied");
  }

  await Blog.findByIdAndDelete(blogId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Blog post deleted successfully")
  );
});

// Add comment to blog post
const addComment = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  // Add comment
  blog.comments.push({
    user: userId,
    content,
    isApproved: false, // Comments need approval
  });

  await blog.save();

  const updatedBlog = await Blog.findById(blogId)
    .populate("author", "name alias avatar")
    .populate("comments.user", "name alias avatar");

  return res.status(200).json(
    new ApiResponse(200, updatedBlog, "Comment added successfully")
  );
});

// Approve comment (admin only)
const approveComment = asyncHandler(async (req, res) => {
  const { blogId, commentId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "admin") {
    throw new ApiError(403, "Only admins can approve comments");
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  const comment = blog.comments.id(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  comment.isApproved = true;
  await blog.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Comment approved successfully")
  );
});

// Like blog post
const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const userId = req.user._id;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, "Blog post not found");
  }

  await blog.incrementLikes();

  return res.status(200).json(
    new ApiResponse(200, { likes: blog.likes + 1 }, "Blog post liked successfully")
  );
});

// Get blog categories
const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = [
    "lifestyle",
    "dating",
    "relationships",
    "travel",
    "fashion",
    "health",
    "tips",
    "news",
    "events",
  ];

  return res.status(200).json(
    new ApiResponse(200, categories, "Blog categories retrieved successfully")
  );
});

// Get blog statistics (admin only)
const getBlogStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (user.role !== "admin") {
    throw new ApiError(403, "Only admins can view blog statistics");
  }

  const totalPosts = await Blog.countDocuments();
  const publishedPosts = await Blog.countDocuments({ status: "published" });
  const draftPosts = await Blog.countDocuments({ status: "draft" });
  const totalViews = await Blog.aggregate([
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalLikes = await Blog.aggregate([
    { $group: { _id: null, totalLikes: { $sum: "$likes" } } },
  ]);

  const stats = {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: totalViews[0]?.totalViews || 0,
    totalLikes: totalLikes[0]?.totalLikes || 0,
  };

  return res.status(200).json(
    new ApiResponse(200, stats, "Blog statistics retrieved successfully")
  );
});

export {
  createBlog,
  getAllBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  addComment,
  approveComment,
  likeBlog,
  getBlogCategories,
  getBlogStats,
};
