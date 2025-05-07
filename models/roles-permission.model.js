import mongoose from "mongoose";
import { Permissions, Roles } from "../enums/role.enum.js";
import { RolePermissions } from "../utils/role-permission.js";

// Role Schema
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: Object.values(Roles), // Enum for role names
      required: true,
      unique: true,
    },
    permissions: {
      type: [String],
      enum: Object.values(Permissions), // Enum for permissions
      required: true,
      default: function () {
        return RolePermissions[this.name]; // Default permissions based on role
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Model Export
export default mongoose.model("Role", roleSchema);
