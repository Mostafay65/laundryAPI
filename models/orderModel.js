import mongoose from "mongoose";
import orderStatus from "../helpers/orderStatus.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
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
    priceOfPackage: {
      type: Number,
      required: false,
      validate: {
        validator: function (val) {
          return val > 0;
        },
        message: "price of package must be greater than 0",
      },
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
