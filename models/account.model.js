import mongoose from "mongoose";
import { ProviderEnum } from "../enums/account-provider.enum.js";

// Account Schema
const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      required: true,
    },
    providerId: {
      type: String,
      required: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    tokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.refreshToken; // Hide refreshToken when converting to JSON
      },
    },
  }
);

// Model Export
export default mongoose.model("Account", accountSchema);
