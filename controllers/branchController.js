import Branch from "../models/branchModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";
import filterBody from "../utilities/filterBody.js";

// Get all branches
export const getAllBranches = catchAsync(async (req, res, next) => {
  const branches = await Branch.find();
  
  res.status(200).json({
    status: "success",
    results: branches.length,
    data: {
      branches
    }
  });
});

// Get a single branch
export const getBranch = catchAsync(async (req, res, next) => {
  const branch = await Branch.findById(req.params.id);
  
  if (!branch) {
    return next(new AppError("No branch found with that ID", 404));
  }
  
  res.status(200).json({
    status: "success",
    data: {
      branch
    }
  });
});

// Create a new branch (admin only)
export const createBranch = catchAsync(async (req, res, next) => {
  // Filter allowed fields
  const filteredBody = filterBody(
    req.body,
    "name",
    "location",
    "workingDays"
  );
  
  // Validate working days structure if provided
  if (filteredBody.workingDays) {
    for (const daySchedule of filteredBody.workingDays) {
      if (!daySchedule.day || !["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(daySchedule.day)) {
        return next(new AppError(`Invalid day value: ${daySchedule.day}`, 400));
      }
      
      if (daySchedule.timeRanges && daySchedule.timeRanges.length > 0) {
        for (const timeRange of daySchedule.timeRanges) {
          if (!timeRange.from || !timeRange.to) {
            return next(new AppError("Time ranges must include 'from' and 'to' values", 400));
          }
          
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (!timeRegex.test(timeRange.from) || !timeRegex.test(timeRange.to)) {
            return next(new AppError("Time must be in format 'HH:MM' (24-hour)", 400));
          }
        }
      }
    }
  }
  
  const branch = await Branch.create(filteredBody);
  
  res.status(201).json({
    status: "success",
    message: "Branch created successfully",
  });
});

// Update a branch (admin only)
export const updateBranch = catchAsync(async (req, res, next) => {
  // Filter allowed fields
  const filteredBody = filterBody(
    req.body,
    "name",
    "location",
    "workingDays"
  );
  
  // Validate working days structure if provided
  if (filteredBody.workingDays) {
    for (const daySchedule of filteredBody.workingDays) {
      if (!daySchedule.day || !["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(daySchedule.day)) {
        return next(new AppError(`Invalid day value: ${daySchedule.day}`, 400));
      }
      
      if (daySchedule.timeRanges && daySchedule.timeRanges.length > 0) {
        for (const timeRange of daySchedule.timeRanges) {
          if (!timeRange.from || !timeRange.to) {
            return next(new AppError("Time ranges must include 'from' and 'to' values", 400));
          }
          
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          if (!timeRegex.test(timeRange.from) || !timeRegex.test(timeRange.to)) {
            return next(new AppError("Time must be in format 'HH:MM' (24-hour)", 400));
          }
        }
      }
    }
  }
  
  const branch = await Branch.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true
  });
  
  if (!branch) {
    return next(new AppError("No branch found with that ID", 404));
  }
  
  res.status(200).json({
    status: "success",
    message: "Branch updated successfully",
  });
});

// Delete a branch (admin only)
export const deleteBranch = catchAsync(async (req, res, next) => {
  const branch = await Branch.findByIdAndDelete(req.params.id);
  
  if (!branch) {
    return next(new AppError("No branch found with that ID", 404));
  }
  
  res.status(204).json({
    status: "success",
    data: null
  });
});

// Get nearest branches
export const getNearestBranches = catchAsync(async (req, res, next) => {
  const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km
  
  if (!longitude || !latitude) {
    return next(new AppError("Please provide longitude and latitude coordinates", 400));
  }
  
  const branches = await Branch.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        $maxDistance: parseInt(maxDistance)
      }
    }
  });
  
  res.status(200).json({
    status: "success",
    results: branches.length,
    data: {
      branches
    }
  });
});