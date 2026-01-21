import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import SuperAdmin from "./models/SuperAdmin.js";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await SuperAdmin.findOne({ email: process.env.SUPERADMIN_EMAIL });
    if (existing) {
      console.log(`⚠️ SuperAdmin already exists: ${existing.email}`);
      return process.exit();
    }

    const hashed = await bcrypt.hash(process.env.SUPERADMIN_PASS, 10);

    const superAdmin = await SuperAdmin.create({
      name: "System SuperAdmin",
      email: process.env.SUPERADMIN_EMAIL,
      password: hashed,
    });

    console.log("✅ SuperAdmin created successfully:", superAdmin.email);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating SuperAdmin:", err.message);
    process.exit(1);
  }
};

createSuperAdmin();
