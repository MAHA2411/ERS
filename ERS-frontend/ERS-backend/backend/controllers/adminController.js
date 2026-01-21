import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Admin from "../models/Admin.js";

/**
 * GET /api/admin/events
 * - SuperAdmin: returns all events
 * - Admin: returns only their events
 */
export const listEvents = async (req, res) => {
  try {
    const query = req.user.role === "SuperAdmin" ? {} : { createdBy: req.user._id };
    const events = await Event.find(query).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("listEvents:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/admin/events
 * - Admin & SuperAdmin can create
 */
export const createEvent = async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      venue: req.body.venue,
      fee: req.body.fee,
      bannerUrl: req.body.bannerUrl,
      createdBy: req.user._id,
      createdByRole: req.user.role
    };
    const event = await Event.create(payload);
    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    console.error("createEvent:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/admin/events/:id
 * - SuperAdmin can edit any event
 * - Admin can edit only own events
 */
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (req.user.role !== "SuperAdmin" && String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed to edit this event" });
    }

    event.title = req.body.title ?? event.title;
    event.description = req.body.description ?? event.description;
    event.date = req.body.date ?? event.date;
    event.venue = req.body.venue ?? event.venue;
    event.fee = req.body.fee ?? event.fee;
    event.bannerUrl = req.body.bannerUrl ?? event.bannerUrl;

    await event.save();
    res.json({ message: "Event updated successfully", event });
  } catch (err) {
    console.error("updateEvent:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/admin/events/:id
 * - SuperAdmin can delete any
 * - Admin can delete only own
 */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (req.user.role !== "SuperAdmin" && String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("deleteEvent:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/admin/registrations
 * - SuperAdmin: see all registrations
 * - Admin: see registrations only for their events
 */
export const listRegistrations = async (req, res) => {
  try {
    if (req.user.role === "SuperAdmin") {
      const regs = await Registration.find()
        .populate("eventId", "title date createdBy createdByRole")
        .populate("user", "name email");
      return res.json(regs);
    }

    // Admin: only registrations belonging to their events
    const myEvents = await Event.find({ createdBy: req.user._id }).select("_id");
    const myEventIds = myEvents.map((e) => e._id);

    const regs = await Registration.find({ eventId: { $in: myEventIds } })
      .populate("eventId", "title date createdBy createdByRole")
      .populate("user", "name email");

    res.json(regs);
  } catch (err) {
    console.error("listRegistrations:", err);
    res.status(500).json({ message: err.message });
  }
};
