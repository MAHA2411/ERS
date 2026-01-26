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
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Role", 
      required: true 
    },

    category: {
      type: String,
      enum: ["TECH", "NON_TECH", "ALL"],
      default: "ALL"
    },

    assignedEvents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: true,
    },

    createdByModel: {
      type: String,
      enum: ["SuperAdmin", "Admin"],
      default: "SuperAdmin"
    }
  },
  { timestamps: true }
);

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Admin", adminSchema);
