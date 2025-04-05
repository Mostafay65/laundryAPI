import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const DB = process.env.CONNECTION_STRING;
    await mongoose.connect(DB);
  } catch (err) {
    console.error("DB Connection Error: " + err);
  }
};

export default connectDB;
