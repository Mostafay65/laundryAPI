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
          return val >= 0;
        },
        message: "price must be greater than or equal 0",
      },
    },
    priceOfPackage: {
      type: Number,
      required: false,
      validate: {
        validator: function (val) {
          return val >= 0;
        },
        message: "price of package must be greater than 0",
      },
      default: 0,
    },
    VAT: {
      type: Number,
      required: false,
      validate: {
        validator: function (val) {
          return val >= 0 && val <= 100;
        },
        message: "VAT must be greater than or equal 0 and less than or equal 100",
      },
      default: 0,
    },
    discount: {
      type: Number,
      required: false,
      validate: {
        validator: function (val) {
          return val >= 0 && val <= 100;
        },
        message: "discount must be greater than or equal 0 and less than or equal 100",
      },
      default: 0,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          validate: {
            validator: function (val) {
              return val > 0;
            },
            message: "quantity must be greater than 0",
          },
        },
        serviceType: {
          type: String,
          enum: {
            values: ["WashAndIron", "Iron", "DryClean"],
            message: "service type is either 'WashAndIron', 'Iron', 'DryClean'",
          },
        },
      },
    ],
    itemsType: {
      type: String,
      enum: {
        values: ["clothes", "blanket", "carpet"],
        message: "items type is either 'clothes', 'blanket', 'carpet'",
        default: "clothes",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
