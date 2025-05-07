import mongoose from "mongoose";

// Member Schema
const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace", // Reference to Workspace model
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role", // Reference to Role model
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now, // Automatically set the current date/time
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Model Export
export default mongoose.model("Member", memberSchema);
