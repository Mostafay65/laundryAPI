import Settings from "../models/settingsModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";

// Update VAT value (admin only)
export const updateVAT = catchAsync(async (req, res, next) => {
  const { vat } = req.body;
  if (!vat) {
    return next(new AppError("VAT value is required", 400));
  }
  const settings = await Settings.findOneAndUpdate(
    {},
    { vat },
    { new: true, upsert: true, runValidators: true }
  );
  res.status(200).json({
    status: "success",
    data: { vat: settings.vat },
  });
});

export const getVAT = catchAsync(async (req, res, next) => {
  const settings = await Settings.findOne();
  res.status(200).json({
    status: "success",
    data: { vat: settings ? settings.vat : 0 },
  });
});
