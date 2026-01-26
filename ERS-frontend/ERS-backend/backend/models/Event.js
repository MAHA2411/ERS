// models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },

    venue: {
      type: String,
      trim: true,
    },

    fee: {
      type: Number,
      default: 0,
    },

    bannerUrl: String,

    capacity: {
      type: Number,
      default: 100,
    },

    category: {
      type: String,
      enum: ["TECH", "NON_TECH"],
      required: true,
    },

    isTeamEvent: {
      type: Boolean,
      default: false,
    },

    minTeamSize: {
      type: Number,
      default: 2,
    },

    maxTeamSize: {
      type: Number,
      default: 5,
    },

    // ✅ SuperAdmin who created the event
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },

    // ✅ MANY SubAdmins for ONE event
    subAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin", // Changed from SubAdmin to Admin
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
