import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      trim: true,
      default: "📊",
    },
    description: String,
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model("Project", projectSchema);

// ✅ ESM export
export default ProjectModel;
