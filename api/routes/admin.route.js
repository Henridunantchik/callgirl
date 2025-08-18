import { Router } from "express";
import { makeLolaPremium } from "../controllers/admin.controller.js";

const router = Router();

// Route de test simple
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Admin route is working!",
    timestamp: new Date().toISOString(),
  });
});

// Route pour mettre Lola Lala Premium
router.post("/make-lola-premium", makeLolaPremium);

export default router;
