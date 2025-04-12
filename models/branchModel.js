import mongoose from "mongoose";
import LocationSchema from "./locationModel.js";

// Schema for a single time range
const timeRangeSchema = new mongoose.Schema(
  {
    from: {
      type: String, // Format: "HH:mm"
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    to: {
      type: String, // Format: "HH:mm"
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  },
  { _id: false }
);

// Schema for a day's working Days
const workingDaysSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    timeRanges: [timeRangeSchema], // Array of working periods
  },
  { _id: false }
);

// Update your BranchSchema to include this
const BranchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required."],
    },
    location: {
      type: LocationSchema,
      required: [true, "Location is required."],
    },
    workingDays: {
      type: [workingDaysSchema],
      default: () => [
        { day: "Saturday", isActive: false, timeRanges: [] },
        { day: "Sunday", isActive: false, timeRanges: [] },
        { day: "Monday", isActive: false, timeRanges: [] },
        { day: "Tuesday", isActive: false, timeRanges: [] },
        { day: "Wednesday", isActive: false, timeRanges: [] },
        { day: "Thursday", isActive: false, timeRanges: [] },
        { day: "Friday", isActive: false, timeRanges: [] },
      ],
    },
  },
  { timestamps: true }
);

// Add a geospatial index to the location.coordinates field
BranchSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.model("Branch", BranchSchema);
