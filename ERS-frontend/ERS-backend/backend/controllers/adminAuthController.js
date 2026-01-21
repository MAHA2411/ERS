import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import SuperAdmin from "../models/SuperAdmin.js";

export const loginAdminOrSuperAdmin = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let user = await SuperAdmin.findOne({ email });
    let role = "SUPER_ADMIN";

    if (!user) {
      user = await Admin.findOne({ email });
      role = "ADMIN";
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
