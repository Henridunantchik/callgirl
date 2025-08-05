import express from "express";
import {
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
} from "../controllers/Report.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const ReportRoute = express.Router();

// Authenticated routes
ReportRoute.post("/create", authenticate, createReport);
ReportRoute.get("/user", authenticate, getUserReports);

// Admin routes
ReportRoute.get("/all", authenticate, getAllReports);
ReportRoute.put("/status/:id", authenticate, updateReportStatus);

export default ReportRoute;
