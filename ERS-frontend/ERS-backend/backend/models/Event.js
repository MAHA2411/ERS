import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin", required: true },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
