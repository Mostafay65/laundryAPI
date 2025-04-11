import mongoose from "mongoose";
import orderStatus from "../helpers/orderStatus.js";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  delivery:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  pickUpDateFrom: {
    type: Date,
    required: true,
  },
  pickUpDateTo: {
    type: Date,
    required: true,
  },
  deliveryDateFrom: {
    type: Date,
    required: true,
  },
  deliveryDateTo: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: Object.values(orderStatus),
      message: `order status is either ${Object.values(orderStatus).join(", ")}`,
    },
    default: orderStatus.waitingForPickUp,
  },
  price: {
    type: Number,
    required: false,
    validate: {
      validator: function (val) {
        return val > 0;
      },
      message: "price must be greater than 0",
    },
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
