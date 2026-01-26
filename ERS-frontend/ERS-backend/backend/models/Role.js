import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // e.g., "SUB_ADMIN", "ADMIN"
  },

  permissions: [
    { type: String } // Example: ["CREATE_EVENT", "EDIT_EVENT", "VIEW_PARTICIPANTS"]
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SuperAdmin", // SuperAdmin creates roles
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Role", roleSchema);
