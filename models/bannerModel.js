import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  arabicImageUrl: {
    type: String,
  },
  englishImageUrl: {
    type: String,
  },
  arabicOffer: {
    type: String,
  },
  englishOffer: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Banner", bannerSchema);
