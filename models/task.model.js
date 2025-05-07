import mongoose from "mongoose";
import { generateTaskCode } from "../utils/uuid.js";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum.js";

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    taskCode: {
      type: String,
      unique: true,
      default: generateTaskCode, // Auto-generate task code
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Reference to Project model
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace", // Reference to Workspace model
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatusEnum), // Enum for task status
      default: TaskStatusEnum.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriorityEnum), // Enum for task
      default: TaskPriorityEnum.MEDIUM,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Model Export
export default mongoose.model("Task", taskSchema);
