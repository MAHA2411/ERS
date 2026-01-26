import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Admin from "../models/Admin.js";
import Role from "../models/Role.js";
import PDFDocument from "pdfkit";

export const getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminCategory = req.user.category;

    let eventQuery = {};
    if (req.user.role === "SUPER_ADMIN") {
      eventQuery = {};
    } else if (req.user.role === "ADMIN") {
      if (adminCategory === "ALL") {
        eventQuery = { 
          $or: [
            { createdBy: adminId },
            { assignedAdmin: adminId }
          ]
        };
      } else {
        eventQuery = { 
          category: adminCategory,
          $or: [
            { createdBy: adminId },
            { assignedAdmin: adminId }
          ]
        };
      }
    }

    const events = await Event.find(eventQuery)
      .populate("assignedAdmin", "name email")
      .populate("assignedSubAdmins", "name email")
      .lean();

    const eventIds = events.map(e => e._id);
    const totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds } });

    const subAdminRole = await Role.findOne({ name: "SUB_ADMIN" });
    const mySubAdmins = subAdminRole 
      ? await Admin.countDocuments({ role: subAdminRole._id, createdBy: adminId })
      : 0;

    const eventStats = await Promise.all(events.map(async (event) => {
      const participantCount = await Registration.countDocuments({ event: event._id });
      return { ...event, participantCount };
    }));

    res.json({
      success: true,
      stats: {
        totalEvents: events.length,
        totalRegistrations,
        totalSubAdmins: mySubAdmins
      },
      events: eventStats
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

export const listEvents = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminCategory = req.user.category;

    let query = {};
    if (req.user.role === "SUPER_ADMIN") {
      query = {};
    } else if (req.user.role === "ADMIN") {
      if (adminCategory === "ALL") {
        query = { 
          $or: [
            { createdBy: adminId },
            { assignedAdmin: adminId }
          ]
        };
      } else {
        query = { 
          category: adminCategory,
          $or: [
            { createdBy: adminId },
            { assignedAdmin: adminId }
          ]
        };
      }
    }

    const events = await Event.find(query)
      .populate("assignedAdmin", "name email")
      .populate("assignedSubAdmins", "name email")
      .sort({ date: 1 });

    res.json({ success: true, events });
  } catch (err) {
    console.error("listEvents:", err);
    res.status(500).json({ message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, location, fee, bannerUrl, capacity, 
            category, isTeamEvent, minTeamSize, maxTeamSize, assignedSubAdmins } = req.body;

    const adminCategory = req.user.category;
    let eventCategory = category || "TECH";
    
    if (adminCategory !== "ALL" && eventCategory !== adminCategory) {
      return res.status(403).json({ 
        message: `You can only create ${adminCategory} events` 
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      venue: venue || location,
      location: location || venue,
      fee: fee || 0,
      bannerUrl,
      capacity: capacity || 100,
      category: eventCategory,
      isTeamEvent: isTeamEvent || false,
      minTeamSize: minTeamSize || 2,
      maxTeamSize: maxTeamSize || 5,
      createdBy: req.user._id,
      createdByModel: req.user.role === "SUPER_ADMIN" ? "SuperAdmin" : "Admin",
      assignedAdmin: req.user._id,
      assignedSubAdmins: assignedSubAdmins || []
    });

    res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (err) {
    console.error("createEvent:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const isOwner = String(event.createdBy) === String(req.user._id);
    const isAssigned = String(event.assignedAdmin) === String(req.user._id);
    
    if (req.user.role !== "SUPER_ADMIN" && !isOwner && !isAssigned) {
      return res.status(403).json({ message: "Not allowed to edit this event" });
    }

    const adminCategory = req.user.category;
    if (req.body.category && adminCategory !== "ALL" && req.body.category !== adminCategory) {
      return res.status(403).json({ message: `You can only manage ${adminCategory} events` });
    }

    Object.assign(event, {
      title: req.body.title ?? event.title,
      description: req.body.description ?? event.description,
      date: req.body.date ?? event.date,
      venue: req.body.venue ?? event.venue,
      location: req.body.location ?? event.location,
      fee: req.body.fee ?? event.fee,
      bannerUrl: req.body.bannerUrl ?? event.bannerUrl,
      capacity: req.body.capacity ?? event.capacity,
      category: req.body.category ?? event.category,
      isTeamEvent: req.body.isTeamEvent ?? event.isTeamEvent,
      minTeamSize: req.body.minTeamSize ?? event.minTeamSize,
      maxTeamSize: req.body.maxTeamSize ?? event.maxTeamSize,
      assignedSubAdmins: req.body.assignedSubAdmins ?? event.assignedSubAdmins
    });

    await event.save();
    res.json({ success: true, message: "Event updated successfully", event });
  } catch (err) {
    console.error("updateEvent:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const isOwner = String(event.createdBy) === String(req.user._id);
    const isAssigned = String(event.assignedAdmin) === String(req.user._id);

    if (req.user.role !== "SUPER_ADMIN" && !isOwner && !isAssigned) {
      return res.status(403).json({ message: "Not allowed to delete this event" });
    }

    await event.deleteOne();
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("deleteEvent:", err);
    res.status(500).json({ message: err.message });
  }
};

export const listRegistrations = async (req, res) => {
  try {
    let eventIds = [];

    if (req.user.role === "SUPER_ADMIN") {
      const regs = await Registration.find()
        .populate("event", "title date venue category")
        .populate("user", "name email");
      return res.json({ success: true, registrations: regs });
    }

    const myEvents = await Event.find({
      $or: [
        { createdBy: req.user._id },
        { assignedAdmin: req.user._id }
      ]
    }).select("_id");
    
    eventIds = myEvents.map((e) => e._id);

    const regs = await Registration.find({ event: { $in: eventIds } })
      .populate("event", "title date venue category")
      .populate("user", "name email");

    res.json({ success: true, registrations: regs });
  } catch (err) {
    console.error("listRegistrations:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    const isOwner = String(event.createdBy) === String(req.user._id);
    const isAssigned = String(event.assignedAdmin) === String(req.user._id);

    if (req.user.role !== "SUPER_ADMIN" && !isOwner && !isAssigned) {
      return res.status(403).json({ message: "Not authorized to view participants" });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email")
      .lean();

    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch participants" });
  }
};

export const downloadParticipantsCSV = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    const isOwner = String(event.createdBy) === String(req.user._id);
    const isAssigned = String(event.assignedAdmin) === String(req.user._id);

    if (req.user.role !== "SUPER_ADMIN" && !isOwner && !isAssigned) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const registrations = await Registration.find({ event: eventId }).lean();

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
};

export const downloadParticipantsPDF = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: "Event not found" });

    const isOwner = String(event.createdBy) === String(req.user._id);
    const isAssigned = String(event.assignedAdmin) === String(req.user._id);

    if (req.user.role !== "SUPER_ADMIN" && !isOwner && !isAssigned) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const registrations = await Registration.find({ event: eventId }).lean();

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
};

export const createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, assignedEvents } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const subAdminRole = await Role.findOne({ name: "SUB_ADMIN" });
    if (!subAdminRole) {
      return res.status(404).json({ message: "SUB_ADMIN role not found" });
    }

    const subAdmin = await Admin.create({
      name,
      email,
      password,
      role: subAdminRole._id,
      category: req.user.category,
      assignedEvents: assignedEvents || [],
      createdBy: req.user._id,
      createdByModel: "Admin"
    });

    if (assignedEvents?.length > 0) {
      await Event.updateMany(
        { _id: { $in: assignedEvents } },
        { $addToSet: { assignedSubAdmins: subAdmin._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Sub-Admin created successfully",
      subAdmin: {
        id: subAdmin._id,
        name: subAdmin.name,
        email: subAdmin.email,
        category: subAdmin.category
      }
    });
  } catch (err) {
    console.error("Create sub-admin error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMySubAdmins = async (req, res) => {
  try {
    const subAdmins = await Admin.find({ createdBy: req.user._id })
      .populate("role", "name")
      .populate("assignedEvents", "title date")
      .select("-password");

    res.json({ success: true, subAdmins });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sub-admins" });
  }
};

export const updateSubAdmin = async (req, res) => {
  try {
    const subAdmin = await Admin.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-Admin not found" });
    }

    subAdmin.name = req.body.name || subAdmin.name;
    subAdmin.email = req.body.email || subAdmin.email;
    
    if (req.body.assignedEvents) {
      await Event.updateMany(
        { assignedSubAdmins: subAdmin._id },
        { $pull: { assignedSubAdmins: subAdmin._id } }
      );
      
      subAdmin.assignedEvents = req.body.assignedEvents;
      
      await Event.updateMany(
        { _id: { $in: req.body.assignedEvents } },
        { $addToSet: { assignedSubAdmins: subAdmin._id } }
      );
    }

    await subAdmin.save();
    res.json({ success: true, message: "Sub-Admin updated", subAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await Admin.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-Admin not found" });
    }

    await Event.updateMany(
      { assignedSubAdmins: subAdmin._id },
      { $pull: { assignedSubAdmins: subAdmin._id } }
    );

    await subAdmin.deleteOne();
    res.json({ success: true, message: "Sub-Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
