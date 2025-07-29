import Banner from "../models/bannerModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";

// Get all banners
export const getAllBanners = catchAsync(async (req, res, next) => {
  const banners = await Banner.find();
  res.status(200).json({
    status: "success",
    results: banners.length,
    data: {
      banners,
    },
  });
});

// Create a banner (admin only)
export const createBanner = catchAsync(async (req, res, next) => {
  const { arabicOffer, englishOffer } = req.body;
  const object = {};
  if (arabicOffer) {
    object.arabicOffer = arabicOffer;
  }
  if (englishOffer) {
    object.englishOffer = englishOffer;
  }
  if (req.files.arabicImage) {
    object.arabicImageUrl = `${req.protocol}://${req.get("host")}/uploads/banners/${
      req.files.arabicImage[0].filename
    }`;
  }
  if (req.files.englishImage) {
    object.englishImageUrl = `${req.protocol}://${req.get("host")}/uploads/banners/${
      req.files.englishImage[0].filename
    }`;
  }
  const banner = await Banner.create(object);
  res.status(201).json({
    status: "success",
    message: "Banner created successfully",
  });
});

// Delete a banner (admin only)
export const deleteBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) {
    return next(new AppError("No banner found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
