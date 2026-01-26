// backend/controllers/superAdminController.js
import Admin from "../models/Admin.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import bcrypt from "bcryptjs";
import { generateCSV, generatePDF } from "../utils/fileGenerator.js";

// ----------- EVENTS -----------

export const getAllEventsWithParticipants = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("subAdmins", "name email")
      .populate("createdBy", "name email");

    const eventsWithCount = await Promise.all(
      events.map(async (e) => {
        const participantCount = await Registration.countDocuments({ event: e._id });
        return { ...e._doc, participantCount };
      })
    );

    res.json({ events: eventsWithCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });

    // Assign this event to SubAdmins
    if (req.body.subAdmins?.length) {
      await Admin.updateMany(
        { _id: { $in: req.body.subAdmins } },
        { $addToSet: { assignedEvents: event._id } }
      );
    }

    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    Object.assign(event, req.body);
    await event.save();

    // Update SubAdmin assignments
    if (req.body.subAdmins) {
      // Remove from old subadmins
      await Admin.updateMany(
        { assignedEvents: event._id },
        { $pull: { assignedEvents: event._id } }
      );
      // Add to new subadmins
      await Admin.updateMany(
        { _id: { $in: req.body.subAdmins } },
        { $addToSet: { assignedEvents: event._id } }
      );
    }

    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.deleteOne();

    // Remove from all SubAdmins
    await Admin.updateMany(
      { assignedEvents: event._id },
      { $pull: { assignedEvents: event._id } }
    );

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------- SUBADMIN MANAGEMENT -----------

export const getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await Admin.find({ role: "SUB_ADMIN" });
    res.json({ subAdmins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, assignedEvents = [] } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // const hashedPassword = await bcrypt.hash(password, 10); // Let model handle hashing

    const subAdmin = await Admin.create({
      name,
      email,
      password, // Plain text, model will hash
      role: "SUB_ADMIN",
      assignedEvents,
      createdBy: req.user._id,
    });

    // Assign this SubAdmin to events
    if (assignedEvents.length) {
      await Event.updateMany(
        { _id: { $in: assignedEvents } },
        { $addToSet: { subAdmins: subAdmin._id } }
      );
    }

    res.status(201).json({ subAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSubAdmin = async (req, res) => {
  try {
    const subAdmin = await Admin.findById(req.params.id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found" });

    const { name, email, password, assignedEvents } = req.body;

    subAdmin.name = name || subAdmin.name;
    subAdmin.email = email || subAdmin.email;
    if (password) subAdmin.password = password; // Model will hash this

    if (assignedEvents) {
      // Remove this subAdmin from old events
      await Event.updateMany(
        { subAdmins: subAdmin._id },
        { $pull: { subAdmins: subAdmin._id } }
      );
      // Add to new events
      await Event.updateMany(
        { _id: { $in: assignedEvents } },
        { $addToSet: { subAdmins: subAdmin._id } }
      );
      subAdmin.assignedEvents = assignedEvents;
    }

    await subAdmin.save();
    res.json({ subAdmin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await Admin.findById(req.params.id);
    if (!subAdmin) return res.status(404).json({ message: "SubAdmin not found" });

    // Remove from assigned events
    await Event.updateMany(
      { subAdmins: subAdmin._id },
      { $pull: { subAdmins: subAdmin._id } }
    );

    await subAdmin.deleteOne();
    res.json({ message: "SubAdmin deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------- PARTICIPANTS -----------

export const getEventParticipants = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id }).populate("user");
    res.json({ registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadParticipantsCSV = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id });
    const csv = generateCSV(registrations);
    res.header("Content-Type", "text/csv");
    res.attachment("participants.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadParticipantsPDF = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id });
    const pdfBuffer = await generatePDF(registrations);
    res.header("Content-Type", "application/pdf");
    res.attachment("participants.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ----------- ANALYTICS -----------

export const getAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalSubAdmins = await Admin.countDocuments({ role: "SUB_ADMIN" });

    const techEvents = await Event.countDocuments({ category: "TECH" });
    const nonTechEvents = await Event.countDocuments({ category: "NON_TECH" });

    res.json({
      analytics: {
        totalEvents,
        totalRegistrations,
        totalSubAdmins,
        techEvents,
        nonTechEvents,
        revenue: 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
