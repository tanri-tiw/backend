import mongoose from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt.js";

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, select: true },
    profilePicture: {
      type: String,
      default: null,
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Pre-save Hook to Hash Password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

// Method to Omit Password
userSchema.methods.omitPassword = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Method to Compare Passwords
userSchema.methods.comparePassword = async function (value) {
  return compareValue(value, this.password);
};

// Model Export
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
