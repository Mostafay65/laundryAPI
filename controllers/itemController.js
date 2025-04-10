import Item from "../models/itemModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";
import filterBody from "../utilities/filterBody.js";

// Get all items
export const getAllItems = catchAsync(async (req, res, next) => {
  const items = await Item.find().select("-__v");

  res.status(200).json({
    status: "success",
    results: items.length,
    data: {
      items,
    },
  });
});

// Get a single item
export const getItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id).select("-__v");

  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      item,
    },
  });
});

// Create a new item
export const createItem = catchAsync(async (req, res, next) => {
  const filteredBody = filterBody(
    req.body,
    "name",
    "priceWashAndIron",
    "priceIronOnly",
    "priceDryClean"
  );

  const item = await Item.create(filteredBody);

  res.status(201).json({
    status: "success",
    message: "Item created successfully!",
    data: {
      item,
    },
  });
});

// Update an item
export const updateItem = catchAsync(async (req, res, next) => {
  const filteredBody = filterBody(
    req.body,
    "name",
    "priceWashAndIron",
    "priceIronOnly",
    "priceDryClean",
    "active"
  );

  const item = await Item.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Item updated successfully!",
    data: {
      item,
    },
  });
});

// delete an item (for admin only)
export const deleteItem = catchAsync(async (req, res, next) => {
  const item = await Item.findByIdAndDelete(req.params.id);

  if (!item) {
    return next(new AppError("No item found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
