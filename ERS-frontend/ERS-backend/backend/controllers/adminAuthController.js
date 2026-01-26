import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";

export const loginAdminOrSuperAdmin = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // Check SUPER_ADMIN first
    let user = await SuperAdmin.findOne({ email });
    let roleName = "SUPER_ADMIN";

    // If not found, check Admin
    if (!user) {
      user = await Admin.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      roleName = user.role; // ADMIN or SUB_ADMIN
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: roleName }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: roleName,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};
