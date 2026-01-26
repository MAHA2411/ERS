import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";

import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import sendEmail from "../utils/sendEmail.js";

const generateTicketPDF = async (event, participant, ticketId, teamMembers = []) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
    initialSize: 100 * 1024,
    incrementAmount: 10 * 1024,
  });

  doc.fontSize(20).text("EventHub - E-Ticket", { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text(`Event: ${event.title}`);
  doc.text(`Date: ${event.date ? new Date(event.date).toDateString() : "TBA"}`);
  doc.text(`Venue: ${event.venue || event.location || "TBA"}`);
  doc.moveDown();
  doc.text(`Attendee: ${participant.name}`);
  doc.text(`Email: ${participant.email}`);
  doc.text(`Phone: ${participant.phone || "-"}`);
  doc.text(`College: ${participant.college || "-"}`);
  doc.moveDown();

  if (teamMembers.length > 0) {
    doc.text("Team Members:", { underline: true });
    teamMembers.forEach((member, idx) => {
      doc.text(`  ${idx + 1}. ${member.name} (${member.email})`);
    });
    doc.moveDown();
  }

  doc.text(`Ticket ID: ${ticketId}`, { underline: true });

  doc.pipe(writableStreamBuffer);
  doc.end();

  await new Promise((resolve) => doc.on("end", resolve));
  return writableStreamBuffer.getContents();
};

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

    const { eventId, name, email, phone, college, department, year, teamName, teamMembers } = req.body;

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

    const existingReg = await Registration.findOne({ user: userId, event: eventId }).session(session);
    if (existingReg) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Already registered for this event" });
    }

    if (event.isTeamEvent) {
      if (!teamMembers || teamMembers.length < (event.minTeamSize - 1)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Team must have at least ${event.minTeamSize} members (including you)`
        });
      }
      if (teamMembers.length > (event.maxTeamSize - 1)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Team cannot have more than ${event.maxTeamSize} members`
        });
      }
    }

    const ticketId = `TICKET-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const registrationData = {
      user: userId,
      event: eventId,
      participant: { name, email, phone, college, department, year },
      ticketId,
      isTeamRegistration: event.isTeamEvent && teamMembers?.length > 0,
      teamName: teamName || null,
      teamMembers: event.isTeamEvent ? (teamMembers || []) : []
    };

    const [registration] = await Registration.create([registrationData], { session });

    await session.commitTransaction();
    session.endSession();

    try {
      const pdfBuffer = await generateTicketPDF(event, { name, email, phone, college }, ticketId, registrationData.teamMembers);

      await sendEmail(
        email,
        `Registration Confirmation - ${event.title}`,
        `<p>Hi ${name},</p>
         <p>Thanks for registering for <strong>${event.title}</strong>.</p>
         <p>Your Ticket ID: <strong>${ticketId}</strong></p>
         ${registrationData.isTeamRegistration ? `<p>Team: ${teamName || 'Your Team'}</p>` : ''}
         <p>Please bring this ticket with you to the event.</p>
         <p>Thanks,<br/>Event Team</p>`,
        [{ filename: `Ticket-${ticketId}.pdf`, content: pdfBuffer }]
      );

      if (registrationData.isTeamRegistration && registrationData.teamMembers.length > 0) {
        for (const member of registrationData.teamMembers) {
          try {
            const memberPdf = await generateTicketPDF(event, member, ticketId, registrationData.teamMembers);
            await sendEmail(
              member.email,
              `Team Registration Confirmation - ${event.title}`,
              `<p>Hi ${member.name},</p>
               <p>You have been registered as a team member for <strong>${event.title}</strong>.</p>
               <p>Team: ${teamName || 'Your Team'}</p>
               <p>Team Leader: ${name}</p>
               <p>Ticket ID: <strong>${ticketId}</strong></p>
               <p>Please bring this confirmation to the event.</p>
               <p>Thanks,<br/>Event Team</p>`,
              [{ filename: `Ticket-${ticketId}.pdf`, content: memberPdf }]
            );
          } catch (memberEmailErr) {
            console.error(`Failed to send email to team member ${member.email}:`, memberEmailErr);
          }
        }
      }
    } catch (emailErr) {
      console.error("Email failed but registration saved:", emailErr);
    }

    return res.status(201).json({
      message: "Registered successfully",
      registrationId: registration._id,
      ticketId,
      isTeamRegistration: registrationData.isTeamRegistration
    });
  } catch (err) {
    console.error("Registration error:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const getMyRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.json([]);

    const registrations = await Registration.find({ user: userId })
      .populate("event", "title date venue location fee bannerUrl isTeamEvent");

    const events = registrations.map((reg) => ({
      ...reg.event?.toObject(),
      ticketId: reg.ticketId,
      registrationId: reg._id,
      status: reg.status,
      isTeamRegistration: reg.isTeamRegistration,
      teamName: reg.teamName,
      teamMembers: reg.teamMembers
    })).filter((e) => e._id);

    return res.json(events);
  } catch (err) {
    console.error("Error fetching registered events:", err);
    return res.status(500).json({ message: "Failed to fetch registered events" });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { registrationId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const registration = await Registration.findOne({ _id: registrationId, user: userId });
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    registration.status = "CANCELLED";
    await registration.save();

    return res.json({ message: "Registration cancelled successfully" });
  } catch (err) {
    console.error("Cancel registration error:", err);
    return res.status(500).json({ message: "Failed to cancel registration" });
  }
};
