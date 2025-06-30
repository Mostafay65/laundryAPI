import Order from "../models/orderModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";
import orderStatus from "../helpers/orderStatus.js";
import roles from "../helpers/roles.js";
import filterBody from "../utilities/filterBody.js";
import Branch from "../models/branchModel.js";
import Item from "../models/itemModel.js";
import Settings from "../models/settingsModel.js";
import User from "../models/userModel.js";

// Get all orders
export const getAllOrders = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.params.branchId) filter.branch = req.params.branchId;
  if (req.user.role == roles.user) filter.user = req.user._id;
  if (req.user.role == roles.delivery) filter.delivery = req.user._id;
  // add filtering for delivery

  const orders = await Order.find(filter)
    .populate({
      path: "user",
      select: "name email location phoneNumber fireBaseToken",
    })
    .populate({
      path: "branch",
      select: "_id name location",
    })
    .populate("items.item");

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
  const order = await Order.findById(req.params.id)
    .populate({
      path: "user",
      select: "name email location phoneNumber fireBaseToken",
    })
    .populate("delivery")
    .populate({
      path: "branch",
      select: "_id name location workingDays",
    })
    .populate("items.item");

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
    "deliveryDateTo",
    "priceOfPackage"
  );
  req.body.user = req.user._id;

  if (req.body.pickUpDateFrom > req.body.deliveryDateFrom) {
    return next(new AppError("Pick up date from must be before delivery date from", 400));
  }

  // Get user location from database
  if (!req.user.location || !req.user.location.coordinates) {
    return next(new AppError("User location is required to assign a branch", 400));
  }

  // Find the nearest branch based on user location

  const nearestBranches = await Branch.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: req.user.location.coordinates,
        },
      },
    },
  }).limit(1);

  if (nearestBranches.length === 0) {
    return next(new AppError("No branches available to process your order", 404));
  }

  // Assign the nearest branch to the order
  req.body.branch = nearestBranches[0]._id;
  const settings = await Settings.findOne();
  req.body.VAT = settings.vat;

  // Create the order with branch assignment
  const order = await Order.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
  });
});

// Update a order
export const updateOrder = catchAsync(async (req, res, next) => {
  const adminFields = ["status", "price", "delivery", "items", "VAT", "discount"];
  const deliveryFields = ["status"];
  const userFields = [
    "pickUpDateFrom",
    "pickUpDateTo",
    "deliveryDateFrom",
    "deliveryDateTo",
    "status",
    "priceOfPackage",
  ];

  // Only admin can update items
  if (req.body.items && req.user.role !== roles.admin) {
    return next(new AppError("Only admin can update items in the order", 403));
  }

  req.body = filterBody(
    req.body,
    ...(req.user.role == roles.admin
      ? adminFields
      : req.user.role == roles.delivery
      ? deliveryFields
      : userFields)
  );

  // validate tant items presest in data base
  if (req.body.items) {
    for (const item of req.body.items) {
      const itemExists = await Item.findById(item.item);
      if (!itemExists) {
        return next(new AppError(`Item with ID ${item.item} does not exist`, 404));
      }
      if (!item.quantity) {
        return next(new AppError(`Item quantity must be provided`, 400));
      }
    }
  }

  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate({
      path: "user",
      select: "name email location phoneNumber fireBaseToken",
    })
    .populate("items.item");

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

// Get orders within a time range
export const getOrdersByTimeRange = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return next(
      new AppError("Please provide both start and end date in query parameters", 400)
    );
  }
  const { userPhone, userName } = req.query;
  let filter = {
    createdAt: {
      $gte: new Date(start),
      $lte: new Date(end),
    },
  };

  let userIds = [];
  if (userPhone || userName) {
    const userQuery = {};
    if (userPhone) userQuery.phoneNumber = userPhone;
    if (userName) userQuery.name = userName;
    const users = await User.find(userQuery).select("_id");
    userIds = users.map((u) => u._id);
    if (userIds.length === 0) {
      // No users found, so no orders will match
      return res
        .status(200)
        .json({ status: "success", results: 0, data: { orders: [] } });
    }
    filter.user = { $in: userIds };
  }

  const orders = await Order.find(filter)
    .populate({ path: "user", select: "name email location phoneNumber fireBaseToken" })
    .populate({ path: "branch", select: "_id name location" })
    .populate("items.item");
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: { orders },
  });
});
