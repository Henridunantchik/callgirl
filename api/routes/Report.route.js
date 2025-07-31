import express from "express";
import {
  createReport,
  getReportsByUser,
  getReportById,
  updateReport,
  getAllReports,
  assignReport,
  resolveReport,
  getReportStats,
} from "../controllers/Report.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { onlyAdmin } from "../middleware/onlyadmin.js";

const ReportRoute = express.Router();

// Authenticated routes
ReportRoute.post("/create", authenticate, createReport);
ReportRoute.get("/user/:userId", authenticate, getReportsByUser);
ReportRoute.get("/:id", authenticate, getReportById);
ReportRoute.put("/update/:id", authenticate, updateReport);

// Admin routes
ReportRoute.get("/admin/all", authenticate, onlyAdmin, getAllReports);
ReportRoute.put("/admin/assign/:id", authenticate, onlyAdmin, assignReport);
ReportRoute.put("/admin/resolve/:id", authenticate, onlyAdmin, resolveReport);
ReportRoute.get("/admin/stats", authenticate, onlyAdmin, getReportStats);

export default ReportRoute;
