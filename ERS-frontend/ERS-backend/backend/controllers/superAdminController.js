import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Payment from "../models/Payment.js";
import Role from "../models/Role.js";

/* =====================================================
   SUPER ADMIN PROFILE
===================================================== */
export const getSuperAdminProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role.name !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: "SUPER_ADMIN",
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
};


export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate("role", "name")        // 🔑 FIX
      .populate("createdBy", "name");  // optional

    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

/* =====================================================
   SUPER ADMIN DASHBOARD
===================================================== */
export const getSuperAdminDashboard = async (req, res) => {
  try {
    /* 🔐 STRICT AUTH CHECK */
    if (!req.user || req.user.role.name !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    /* ============================
       ROLE IDS
    ============================ */
    const adminRole = await Role.findOne({ name: "ADMIN" });
    const subAdminRole = await Role.findOne({ name: "SUB_ADMIN" });

    const totalAdmins = adminRole
      ? await Admin.countDocuments({ role: adminRole._id })
      : 0;

    const totalSubAdmins = subAdminRole
      ? await Admin.countDocuments({ role: subAdminRole._id })
      : 0;

    /* ============================
       COUNTS (REAL-TIME)
    ============================ */
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    /* ============================
       REVENUE
    ============================ */
    const revenueResult = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    /* ============================
       EVENT LIST + PARTICIPANTS
    ============================ */
    const events = await Event.find()
      .populate("assignedAdmin", "name")
      .lean();

    const registrations = await Registration.aggregate([
      {
        $group: {
          _id: "$eventId",
          count: { $sum: 1 },
        },
      },
    ]);

    const registrationMap = {};
    registrations.forEach(item => {
      registrationMap[item._id.toString()] = item.count;
    });

    const eventStats = events.map(event => ({
      eventId: event._id,
      eventName: event.title,
      date: event.date,
      venue: event.location,
      assignedAdmin: event.assignedAdmin?.name || "Not Assigned",
      participants: registrationMap[event._id.toString()] || 0,
    }));

    /* ============================
       RESPONSE
    ============================ */
    res.status(200).json({
      success: true,
      stats: {
        totalAdmins,
        totalSubAdmins,
        totalUsers,
        totalEvents,
        totalRegistrations,
        revenue,
      },
      eventStats,
    });
  } catch (error) {
    console.error("SuperAdmin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};
