import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
//import adminRoutes from "./routes/adminRoutes.js";
//import adminUserRoutes from "./routes/adminUserRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import registerEventRoutes from "./routes/registerEventRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import subAdminRoutes from "./routes/subAdminRoutes.js";
dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ROUTES
app.use("/api/auth", authRoutes);
//app.use("/api/admin", adminRoutes); // Admin routes
//app.use("/api/admin/users", adminUserRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/register-event", registerEventRoutes);
app.use("/api/user", userRoutes);

// SuperAdmin routes under same /api/admin prefix
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/subadmin", subAdminRoutes);
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
