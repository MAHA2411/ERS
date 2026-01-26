import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import PDFDocument from "pdfkit";

/* ================================
   SUB ADMIN DASHBOARD
================================ */
export const getSubAdminDashboard = async (req, res) => {
  try {
    const subAdminId = req.user._id;

    const assignedEvents = await Event.find({
      $or: [
        { assignedSubAdmins: subAdminId },
        { assignedAdmin: subAdminId }
      ]
    }).lean();

    const eventIds = assignedEvents.map(e => e._id);

    const totalRegistrations = await Registration.countDocuments({
      event: { $in: eventIds }
    });

    const eventStats = await Promise.all(
      assignedEvents.map(async event => {
        const participantCount = await Registration.countDocuments({
          event: event._id
        });
        return { ...event, participantCount };
      })
    );

    res.json({
      success: true,
      stats: {
        totalEvents: assignedEvents.length,
        totalRegistrations
      },
      events: eventStats
    });
  } catch (err) {
    console.error("SubAdmin dashboard error:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

/* ================================
   ASSIGNED EVENTS
================================ */
export const getAssignedEvents = async (req, res) => {
  try {
    const subAdminId = req.user._id;

    const events = await Event.find({
      $or: [
        { assignedSubAdmins: subAdminId },
        { assignedAdmin: subAdminId }
      ]
    })
      .populate("assignedAdmin", "name email")
      .lean();

    res.json({ success: true, events });
  } catch {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

/* ================================
   EVENT PARTICIPANTS
================================ */
export const getEventParticipants = async (req, res) => {
  try {
    const subAdminId = req.user._id;
    const eventId = req.params.eventId;

    const event = await Event.findOne({
      _id: eventId,
      $or: [
        { assignedSubAdmins: subAdminId },
        { assignedAdmin: subAdminId }
      ]
    });

    if (!event)
      return res.status(403).json({ message: "Not authorized" });

    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email phone college department year")
      .lean();

    res.json({ success: true, registrations });
  } catch {
    res.status(500).json({ message: "Failed to fetch participants" });
  }
};

/* ================================
   DOWNLOAD CSV
================================ */
export const downloadParticipantsCSV = async (req, res) => {
  try {
    const subAdminId = req.user._id;
    const eventId = req.params.eventId;

    const event = await Event.findOne({
      _id: eventId,
      $or: [
        { assignedSubAdmins: subAdminId },
        { assignedAdmin: subAdminId }
      ]
    });

    if (!event)
      return res.status(403).json({ message: "Not authorized" });

    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email phone college department year")
      .lean();

    let csv =
      "Ticket ID,Name,Email,Phone,College,Department,Year,Team Name,Team Members,Status,Registered At\n";

    registrations.forEach(reg => {
      const teamMembers =
        reg.teamMembers?.map(m => `${m.name}(${m.email})`).join("; ") || "";

      csv += `"${reg.ticketId}",
"${reg.user?.name || ""}",
"${reg.user?.email || ""}",
"${reg.user?.phone || ""}",
"${reg.user?.college || ""}",
"${reg.user?.department || ""}",
"${reg.user?.year || ""}",
"${reg.teamName || ""}",
"${teamMembers}",
"${reg.status}",
"${new Date(reg.createdAt).toLocaleString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=participants-${event.title.replace(/\s+/g, "_")}.csv`
    );
    res.send(csv);
  } catch {
    res.status(500).json({ message: "Failed to generate CSV" });
  }
};

/* ================================
   DOWNLOAD PDF
================================ */
export const downloadParticipantsPDF = async (req, res) => {
  try {
    const subAdminId = req.user._id;
    const eventId = req.params.eventId;

    const event = await Event.findOne({
      _id: eventId,
      $or: [
        { assignedSubAdmins: subAdminId },
        { assignedAdmin: subAdminId }
      ]
    });

    if (!event)
      return res.status(403).json({ message: "Not authorized" });

    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email")
      .lean();

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=participants-${event.title.replace(/\s+/g, "_")}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text(`Participants - ${event.title}`, { align: "center" });
    doc.moveDown();

    registrations.forEach((reg, i) => {
      doc.fontSize(10).text(
        `${i + 1}. ${reg.user?.name || "N/A"} - ${
          reg.user?.email || "N/A"
        } - ${reg.ticketId}`
      );

      if (reg.teamMembers?.length) {
        doc.text(
          `   Team: ${reg.teamName || "N/A"} | Members: ${reg.teamMembers
            .map(m => m.name)
            .join(", ")}`
        );
      }
    });

    doc.end();
  } catch {
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};
