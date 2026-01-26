// backend/controllers/subAdminController.js
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Admin from "../models/Admin.js";
import { generateCSV, generatePDF } from "../utils/fileGenerator.js";

// Get only events assigned to this SubAdmin
export const getAssignedEvents = async (req, res) => {
  try {
    const subAdmin = await Admin.findById(req.user._id).populate("assignedEvents");

    // Calculate participant count for each assigned event
    const eventsWithCount = await Promise.all(
      subAdmin.assignedEvents.map(async (e) => {
        const participantCount = await Registration.countDocuments({ event: e._id });
        return { ...e._doc, participantCount };
      })
    );

    res.json({ events: eventsWithCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get participants for an event if assigned to this SubAdmin
export const getEventParticipants = async (req, res) => {
  try {
    const subAdmin = await Admin.findById(req.user._id);

    const assignedEventIds = subAdmin.assignedEvents.map(e => e.toString());
    if (!assignedEventIds.includes(req.params.id)) {
      return res.status(403).json({ message: "Not assigned to this event" });
    }

    const registrations = await Registration.find({ event: req.params.id });
    res.json({ registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CSV / PDF
export const downloadParticipantsCSV = async (req, res) => {
  try {
    const subAdmin = await Admin.findById(req.user._id);
    const assignedEventIds = subAdmin.assignedEvents.map(e => e.toString());
    if (!assignedEventIds.includes(req.params.id)) {
      return res.status(403).json({ message: "Not assigned to this event" });
    }

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
    const subAdmin = await Admin.findById(req.user._id);
    const assignedEventIds = subAdmin.assignedEvents.map(e => e.toString());
    if (!assignedEventIds.includes(req.params.id)) {
      return res.status(403).json({ message: "Not assigned to this event" });
    }

    const registrations = await Registration.find({ event: req.params.id });
    const pdfBuffer = await generatePDF(registrations);
    res.header("Content-Type", "application/pdf");
    res.attachment("participants.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
