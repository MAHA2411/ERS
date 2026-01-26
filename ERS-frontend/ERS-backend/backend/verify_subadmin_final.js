import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const verifySubAdminFlow = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const testEmail = "debug_subadmin@test.com";
        const testPass = "123456";

        // 1. Cleanup
        await Admin.deleteOne({ email: testEmail });

        // 2. Create via Model directly (simulating Controller)
        console.log("Creating SubAdmin...");
        const subAdmin = await Admin.create({
            name: "Debug SubAdmin",
            email: testEmail,
            password: testPass,
            role: "SUB_ADMIN",
            category: "ALL",
            createdBy: new mongoose.Types.ObjectId(), // Fake ID
            createdByModel: "SuperAdmin"
        });

        console.log("SubAdmin created with ID:", subAdmin._id);
        console.log("Stored Password Hash:", subAdmin.password);

        // 3. Verify Hash
        const isMatch = await bcrypt.compare(testPass, subAdmin.password);
        console.log(`Password Match (Expect TRUE): ${isMatch}`);

        if (!isMatch) {
            console.error("❌ CRITICAL: Password comparison failed! Likely double-hashing or no hashing.");
        } else {
            console.log("✅ SUCCESS: Password hashed correctly and matches.");
        }

        // Cleanup
        await Admin.deleteOne({ email: testEmail });
        console.log("Cleanup done.");
        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

verifySubAdminFlow();
