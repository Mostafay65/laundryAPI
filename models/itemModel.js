import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
    unique: true,
  },
  priceWashAndIron: {
    type: Number,
    required: [true, "Price for wash and iron is required"],
    min: 0,
  },
  priceIronOnly: {
    type: Number,
    required: [true, "Price for iron only is required"],
    min: 0,
  },
  priceDryClean: {
    type: Number,
    required: [true, "Price for dry clean is required"],
    min: 0,
  },
});

const Item = mongoose.model("Item", itemSchema);

export default Item;
