/*import express from "express";
import { protect, verifySuperAdmin } from "../middleware/authMiddleware.js";
import { getAdmins, addAdmin, updateAdmin, deleteAdmin } from "../controllers/adminUserController.js";

const router = express.Router();

// All routes here are for SuperAdmin only (manage Admins)
router.use(protect, verifySuperAdmin);

router.get("/", getAdmins);
router.post("/", addAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;*/
