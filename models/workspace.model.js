import mongoose from "mongoose";
import { generateInviteCode } from "../utils/uuid.js";

// Workspace Schema
const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: generateInviteCode, // Auto-generate invite code
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Method to Reset Invite Code
workspaceSchema.methods.resetInviteCode = function () {
  this.inviteCode = generateInviteCode();
  return this.save(); // Save the updated invite code
};

// Model Export
export default mongoose.model("Workspace", workspaceSchema);
