import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    // required: [true, "Banner image URL is required."],
  },
  offer: {
    type: String,
    // required: [true, "Banner offer is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Banner", bannerSchema);
