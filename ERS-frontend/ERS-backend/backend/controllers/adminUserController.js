import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

// GET /api/admin/users        (SuperAdmin only)
export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (err) {
    console.error("getAdmins:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/users       (SuperAdmin only)
export const addAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

    const e = email.trim().toLowerCase();
    const exists = await Admin.findOne({ email: e });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email: e, password: hashed });
    res.status(201).json({ id: admin._id, name: admin.name, email: admin.email });
  } catch (err) {
    console.error("addAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id    (SuperAdmin only)
export const updateAdmin = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const updateData = { ...rest };
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error("updateAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:id (SuperAdmin only)
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted" });
  } catch (err) {
    console.error("deleteAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};
