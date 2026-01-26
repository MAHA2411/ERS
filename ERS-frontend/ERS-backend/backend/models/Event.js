import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
    venue: String,
    fee: { type: Number, default: 0 },
    bannerUrl: String,
    capacity: { type: Number, default: 100 },
    
    category: {
      type: String,
      enum: ["TECH", "NON_TECH"],
      default: "TECH"
    },

    isTeamEvent: {
      type: Boolean,
      default: false
    },

    minTeamSize: {
      type: Number,
      default: 2
    },

    maxTeamSize: {
      type: Number,
      default: 5
    },

    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      refPath: "createdByModel",
      required: true 
    },

    createdByModel: {
      type: String,
      enum: ["SuperAdmin", "Admin"],
      default: "SuperAdmin"
    },

    assignedAdmin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Admin"
    },

    assignedSubAdmins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
