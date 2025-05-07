import mongoose from "mongoose";
import { config } from "./app.config.js";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to Mongo database");
  } catch (error) {
    console.error("Error connecting to Mongo database:");
    console.error(error.message); // Log the actual reason
    process.exit(1); // Exit the process
  }
};

export default connectDatabase;
