// models/Admin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "SUB_ADMIN"],
      default: "SUB_ADMIN",
    },

    category: {
      type: String,
      enum: ["TECH", "NON_TECH", "ALL"],
      default: "ALL",
    },

    assignedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event", // SubAdmin can manage multiple events
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel", // Usually SuperAdmin
      required: true,
    },

    createdByModel: {
      type: String,
      enum: ["SuperAdmin", "Admin"],
      default: "SuperAdmin",
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password
adminSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Admin", adminSchema);
