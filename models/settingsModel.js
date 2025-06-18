import mongoose from "mongoose";
const settingsSchema = new mongoose.Schema({
  vat: {
    type: Number,
    required: true,
    validate: {
      validator: function (val) {
        return val >= 0 && val <= 100;
      },
      message: "VAT must be greater than or equal 0 and less than or equal 100",
    },
    default: 0,
  },
});
export default mongoose.model("Settings", settingsSchema);
