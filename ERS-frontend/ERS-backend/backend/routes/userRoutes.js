import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET current logged-in user profile
router.get("/profile", protect, (req, res) => {
  res.json(req.user); // comes from protect middleware
});

export default router;
