import Report from "../models/report.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a report
const createReport = asyncHandler(async (req, res) => {
  const { type, targetId, targetType, reason, description } = req.body;
  const userId = req.user._id;

  if (!type || !targetId || !targetType || !reason) {
    throw new ApiError(400, "Type, target ID, target type, and reason are required");
  }

  // Check if user has already reported this target
  const existingReport = await Report.findOne({
    user: userId,
    targetId,
    targetType,
  });

  if (existingReport) {
    throw new ApiError(400, "You have already reported this item");
  }

  const report = await Report.create({
    user: userId,
    type,
    targetId,
    targetType,
    reason,
    description,
  });

  const populatedReport = await Report.findById(report._id)
    .populate("user", "name alias");

  return res.status(201).json(
    new ApiResponse(201, populatedReport, "Report created successfully")
  );
});

// Get user's reports
const getUserReports = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const reports = await Report.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Report.countDocuments({ user: userId });

  return res.status(200).json(
    new ApiResponse(200, {
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "User reports retrieved successfully")
  );
});

// Get all reports (admin only)
const getAllReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, type } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};
  
  if (status) filter.status = status;
  if (type) filter.type = type;

  const reports = await Report.find(filter)
    .populate("user", "name alias")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Report.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    }, "All reports retrieved successfully")
  );
});

// Update report status (admin only)
const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, adminNotes } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  const updatedReport = await Report.findByIdAndUpdate(
    reportId,
    {
      status,
      adminNotes,
      resolvedAt: status === "resolved" ? new Date() : null,
    },
    { new: true }
  ).populate("user", "name alias");

  return res.status(200).json(
    new ApiResponse(200, updatedReport, "Report status updated successfully")
  );
});

export {
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
}; 