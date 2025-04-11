import Order from "../models/orderModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";
import orderStatus from "../helpers/orderStatus.js";
import roles from "../helpers/roles.js";
import filterBody from "../utilities/filterBody.js";

// Get all orders
export const getAllOrders = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role == roles.user) filter.user = req.user._id;
  // add filtering for delevery

  const orders = await Order.find(filter).populate({
    path: "user",
    select: "name email location",
  });

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Get a single order
export const getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: "user",
    select: "name email location",
  });

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

// Create a new order
export const createOrder = catchAsync(async (req, res, next) => {
  req.body = filterBody(
    req.body,
    "pickUpDateFrom",
    "pickUpDateTo",
    "deliveryDateFrom",
    "deliveryDateTo"
  );
  req.body.user = req.user._id;

  if (req.body.pickUpDateFrom > req.body.deliveryDateFrom) {
    return next(new AppError("Pick up date from must be before delivery date from", 400));
  }

  const order = await Order.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
  });
});

// Update a order
export const updateOrder = catchAsync(async (req, res, next) => {
  const adminFields = ["status", "price"];
  const deliveryFields = ["status"];
  const userFields = [
    "pickUpDateFrom",
    "pickUpDateTo",
    "deliveryDateFrom",
    "deliveryDateTo",
    "status",
  ];

  // filter body
  // spread the list of fields into the filterBody function
  req.body = filterBody(
    req.body,
    ...(req.user.role == roles.admin
      ? adminFields
      : req.user.role == roles.delivery
      ? deliveryFields
      : userFields)
  );

  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate({
    path: "user",
    select: "name email location",
  });

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Order updated successfully",
  });
});

// Delete a order
export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Check if user is authorized to delete this order
  if (
    !req.user.role.includes("admin") &&
    order.user.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("You are not authorized to delete this order", 403));
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    message: "Order deleted successfully",
  });
});
