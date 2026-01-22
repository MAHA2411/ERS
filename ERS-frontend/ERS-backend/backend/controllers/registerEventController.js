// controllers/registerEventController.js
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";

import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import sendEmail from "../utils/sendEmail.js";

/**
 * POST /api/register-event
 * Requires auth. Body: { eventId, name, email, phone?, college?, department?, year? }
 */
export const registerEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?._id;
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { eventId, name, email, phone, college, department, year } = req.body;
    if (!eventId || !name || !email) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Event not found" });
    }

    // Generate ticket ID
    const ticketId = `TICKET-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    // Save registration
    const [registration] = await Registration.create(
      [
        {
          user: userId,
          event: eventId, // use correct field
          participant: { name, email, phone, college, department, year },
          ticketId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send PDF email
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
        initialSize: 100 * 1024,
        incrementAmount: 10 * 1024,
      });

      doc.fontSize(20).text("EventHub - E-Ticket", { align: "center" });
      doc.moveDown();
      doc.fontSize(16).text(`Event: ${event.title}`);
      doc.text(`Date: ${event.date ? new Date(event.date).toDateString() : "TBA"}`);
      doc.text(`Venue: ${event.venue || "TBA"}`);
      doc.moveDown();
      doc.text(`Attendee: ${name}`);
      doc.text(`Email: ${email}`);
      doc.text(`Phone: ${phone || "-"}`);
      doc.moveDown();
      doc.text(`Ticket ID: ${ticketId}`, { underline: true });

      doc.pipe(writableStreamBuffer);
      doc.end();

      await new Promise((resolve) => doc.on("end", resolve));
      const pdfBuffer = writableStreamBuffer.getContents();

      await sendEmail(
        email,
        `Registration Confirmation - ${event.title}`,
        `<p>Hi ${name},</p>
         <p>Thanks for registering for <strong>${event.title}</strong>.</p>
         <p>Your Ticket ID: <strong>${ticketId}</strong></p>
         <p>Please bring this ticket with you to the event.</p>
         <p>Thanks,<br/>Event Team</p>`,
        [{ filename: `Ticket-${ticketId}.pdf`, content: pdfBuffer }]
      );
    } catch (emailErr) {
      console.error("Email failed but registration saved:", emailErr);
    }

    return res.status(201).json({
      message: "Registered successfully",
      registrationId: registration._id,
      ticketId,
    });
  } catch (err) {
    console.error("Registration error:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * GET /api/register-event/mine
 * Returns all events the logged-in user registered for
 */
export const getMyRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const registrations = await Registration.find({ user: userId })
      .populate("event", "title date venue fee image"); // correct field

    const events = registrations.map((reg) => reg.event).filter((e) => e);

    return res.json(events);
  } catch (err) {
    console.error("Error fetching registered events:", err);
    return res.status(500).json({ message: "Failed to fetch registered events" });
  }
};
