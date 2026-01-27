import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

/**
 * Create Event (Admin / SuperAdmin)
 * POST /api/events
 */
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id, // track creator
    });

    res.status(201).json({ message: "Event created", event });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
};

/**
 * Edit Event
 * PUT /api/events/:id
 */
export const editEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Admin can only edit their own events
    if (req.user.role !== "SuperAdmin" && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({ message: "Event updated", event });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Failed to update event" });
  }
};

/**
 * Get Events
 * GET /api/events
 */
export const getEvents = async (req, res) => {
  try {
    let events;

    if (!req.user) {
      // Public browsing
      events = await Event.find().select("title description date venue fee bannerUrl");
    } else if (req.user.role === "SuperAdmin") {
      events = await Event.find();
    } else {
      events = await Event.find({ createdBy: req.user._id });
    }

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

/**
 * Get Registrations (Role-based)
 * GET /api/events/registrations
 */
export const getRegistrations = async (req, res) => {
  try {
    let registrations;

    if (req.user.role === "SuperAdmin") {
      registrations = await Registration.find().populate("eventId", "title date venue createdBy bannerUrl");
    } else {
      // Admin sees only registrations for their events
      const allRegs = await Registration.find().populate("eventId", "title date venue createdBy bannerUrl");
      registrations = allRegs.filter(
        (reg) => reg.eventId && reg.eventId.createdBy.toString() === req.user._id.toString()
      );
    }

    res.json(registrations);
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};

/**
 * Get Events registered by logged-in user
 * GET /api/events/mine
 */
export const getMyRegisteredEvents = async (req, res) => {
  try {
    if (!req.user || !req.user._id)
      return res.status(401).json({ message: "User not authenticated" });

    const registrations = await Registration.find({ user: req.user._id }).populate(
      "eventId",
      "title description date venue fee bannerUrl"
    );

    // Filter out deleted events
    const events = registrations.map((reg) => reg.eventId).filter((event) => event !== null);

    res.json(events);
  } catch (error) {
    console.error("Error fetching user's registrations:", error);
    res.status(500).json({ message: "Failed to fetch your registered events" });
  }
};
