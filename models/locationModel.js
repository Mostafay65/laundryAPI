import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: { values: ["Point"], message: "Location type must be Point." },
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: undefined,
      required: [true, "Coordinates are required."],
      validate: {
        validator: function (coords) {
          return (
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords.every((num) => typeof num === "number")
          );
        },
        message:
          "Coordinates must be an array with exactly two numbers: [longitude, latitude].",
      },
    },
    buildingNo: String,
    floorNo: String,
    apartmentNo: String,
    buildingLockCode: String,
    securityGuardMobile: String,
  },
  { _id: false }
);

export default LocationSchema;
