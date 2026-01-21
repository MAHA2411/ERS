// models/Registration.js
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    participant: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      college: { type: String, required: true },
      department: { type: String },
      year: { type: String },
    },

    ticketId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["REGISTERED", "CANCELLED", "ATTENDED"],
      default: "REGISTERED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);
