import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }], // e.g., ["CREATE_EVENT", "VIEW_PAYMENTS"]
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin", required: true }
}, { timestamps: true });

export default mongoose.model("Role", roleSchema);
