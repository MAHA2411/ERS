import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Payment from "../models/Payment.js";

/**
 * SUPER ADMIN PROFILE
 */
export const getSuperAdminProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * SUPER ADMIN DASHBOARD
 */
export const getSuperAdminDashboard = async (req, res) => {
  try {
    const totalAdmins = await Admin.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    // ✅ Revenue from Payment collection
    const revenueResult = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const revenue = revenueResult[0]?.total || 0;

    // ✅ Event-wise registrations
    const eventStats = await Registration.aggregate([
      {
        $group: {
          _id: "$eventId",
          participants: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $project: {
          _id: 0,
          eventName: "$event.title",
          date: "$event.date",
          venue: "$event.location",
          participants: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAdmins,
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
