import express from "express";
import { protect, verifySuperAdmin } from "../middleware/authMiddleware.js";
import PDFDocument from "pdfkit";

import Admin from "../models/Admin.js";
import Role from "../models/Role.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Payment from "../models/Payment.js";

import {
  getSuperAdminProfile,
  getSuperAdminDashboard
} from "../controllers/superAdminController.js";

const router = express.Router();

router.get("/profile", protect, verifySuperAdmin, getSuperAdminProfile);
router.get("/dashboard", protect, verifySuperAdmin, getSuperAdminDashboard);

router.post("/admin", protect, verifySuperAdmin, async (req, res) => {
  try {
    const { name, email, password, roleName, category } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(404).json({ message: "Invalid role" });

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role._id,
      category: category || "ALL",
      createdBy: req.user._id,
      createdByModel: "SuperAdmin"
    });

    res.status(201).json({
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: role.name,
        category: admin.category
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admins", protect, verifySuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate("role", "name")
      .populate("assignedEvents", "title")
      .select("-password");

    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/admin/:id", protect, verifySuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (req.body.roleName) {
      const role = await Role.findOne({ name: req.body.roleName });
      if (!role) return res.status(404).json({ message: "Role not found" });
      admin.role = role._id;
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.category = req.body.category || admin.category;

    await admin.save();
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/admin/:id", protect, verifySuperAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await Event.updateMany(
      { $or: [{ assignedAdmin: admin._id }, { assignedSubAdmins: admin._id }] },
      { $pull: { assignedSubAdmins: admin._id }, $unset: { assignedAdmin: "" } }
    );

    await admin.deleteOne();
    res.json({ success: true, message: "Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/event", protect, verifySuperAdmin, async (req, res) => {
  try {
    const { title, description, date, location, venue, assignedAdmin, category,
            isTeamEvent, minTeamSize, maxTeamSize, capacity, fee } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location: location || venue,
      venue: venue || location,
      category: category || "TECH",
      isTeamEvent: isTeamEvent || false,
      minTeamSize: minTeamSize || 2,
      maxTeamSize: maxTeamSize || 5,
      capacity: capacity || 100,
      fee: fee || 0,
      createdBy: req.user._id,
      createdByModel: "SuperAdmin",
      assignedAdmin: assignedAdmin || null
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/event/:id", protect, verifySuperAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    Object.assign(event, {
      title: req.body.title ?? event.title,
      description: req.body.description ?? event.description,
      date: req.body.date ?? event.date,
      location: req.body.location ?? event.location,
      venue: req.body.venue ?? event.venue,
      assignedAdmin: req.body.assignedAdmin ?? event.assignedAdmin,
      category: req.body.category ?? event.category,
      isTeamEvent: req.body.isTeamEvent ?? event.isTeamEvent,
      minTeamSize: req.body.minTeamSize ?? event.minTeamSize,
      maxTeamSize: req.body.maxTeamSize ?? event.maxTeamSize,
      capacity: req.body.capacity ?? event.capacity,
      fee: req.body.fee ?? event.fee
    });

    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/event/:id", protect, verifySuperAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/events", protect, verifySuperAdmin, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("assignedAdmin", "name email category")
      .populate("assignedSubAdmins", "name email");
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/events-with-participants", protect, verifySuperAdmin, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("assignedAdmin", "name email category")
      .populate("assignedSubAdmins", "name email")
      .lean();

    for (let event of events) {
      const regs = await Registration.find({ event: event._id })
        .populate("user", "name email");

      event.participants = regs.map((r) => ({
        ...r.participant,
        ticketId: r.ticketId,
        status: r.status,
        isTeamRegistration: r.isTeamRegistration,
        teamName: r.teamName,
        teamMembers: r.teamMembers
      }));
      event.participantCount = regs.length;
    }

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/events/:eventId/participants", protect, verifySuperAdmin, async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate("user", "name email")
      .lean();

    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch participants" });
  }
});

router.get("/events/:eventId/download/csv", protect, verifySuperAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registrations = await Registration.find({ event: req.params.eventId }).lean();

    let csvContent = "Ticket ID,Participant Name,Email,Phone,College,Department,Year,Team Name,Team Members,Status,Registered At\n";

    registrations.forEach(reg => {
      const teamMembersList = reg.teamMembers?.map(tm => `${tm.name}(${tm.email})`).join("; ") || "";
      csvContent += `"${reg.ticketId}","${reg.participant.name}","${reg.participant.email}","${reg.participant.phone || ''}","${reg.participant.college || ''}","${reg.participant.department || ''}","${reg.participant.year || ''}","${reg.teamName || ''}","${teamMembersList}","${reg.status}","${new Date(reg.createdAt).toLocaleString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=participants-${event.title.replace(/\s+/g, '_')}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate CSV" });
  }
});

router.get("/events/:eventId/download/pdf", protect, verifySuperAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const registrations = await Registration.find({ event: req.params.eventId }).lean();

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=participants-${event.title.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);

    doc.fontSize(20).text(`Participants List - ${event.title}`, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date(event.date).toLocaleDateString()}`);
    doc.text(`Location: ${event.location || event.venue || 'TBA'}`);
    doc.text(`Category: ${event.category}`);
    doc.text(`Total Participants: ${registrations.length}`);
    doc.moveDown();

    doc.fontSize(10);
    registrations.forEach((reg, idx) => {
      doc.text(`${idx + 1}. ${reg.participant.name} - ${reg.participant.email} - ${reg.ticketId}`);
      if (reg.isTeamRegistration && reg.teamMembers?.length > 0) {
        doc.text(`   Team: ${reg.teamName || 'N/A'} | Members: ${reg.teamMembers.map(m => m.name).join(", ")}`);
      }
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

router.get("/analytics", protect, verifySuperAdmin, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    
    const adminRole = await Role.findOne({ name: "ADMIN" });
    const subAdminRole = await Role.findOne({ name: "SUB_ADMIN" });
    
    const totalAdmins = adminRole ? await Admin.countDocuments({ role: adminRole._id }) : 0;
    const totalSubAdmins = subAdminRole ? await Admin.countDocuments({ role: subAdminRole._id }) : 0;

    const techEvents = await Event.countDocuments({ category: "TECH" });
    const nonTechEvents = await Event.countDocuments({ category: "NON_TECH" });

    const revenueResult = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const eventStats = await Event.aggregate([
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "registrations"
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          date: 1,
          participantCount: { $size: "$registrations" }
        }
      },
      { $sort: { participantCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      analytics: {
        totalEvents,
        totalRegistrations,
        totalAdmins,
        totalSubAdmins,
        techEvents,
        nonTechEvents,
        revenue,
        topEvents: eventStats
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
