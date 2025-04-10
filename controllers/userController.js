import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";
import filterBody from "../utilities/filterBody.js";
import roles from "../helpers/roles.js";

export const getAllUsers = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    results: (await User.countDocuments()).length,
    data: {
      users: await User.find({ role: req.params.role }),
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const userRoleAdmin = req.user.role.includes(roles.admin);

  if ((req.body.email || req.body.password || req.body.role || req.body.accountStatus) && !userRoleAdmin)
    return next(
      new AppError(
        "Users aren't authorized to update email, password or account status",
        401
      )
    );

  req.body = filterBody(
    req.body,
    "name",
    "email",
    "password",
    "phoneNumber",
    "bio",
    "accountStatus",
    "location",
    "buildingNo",
    "floorNo",
    "apartmentNo",
    "buildingLockCode",
    "securityGuardMobile",
    userRoleAdmin ? "role" : ""
  );

  const user = await User.findById(req.params.id);

  if (req.body.location) {
    // Create location object starting with existing data or empty object
    const locationUpdate = user.location || {};

    // Only update coordinates if provided
    locationUpdate.coordinates = req.body.location;

    // Only update each property if it's provided in the request
    if (req.body.buildingNo !== undefined)
      locationUpdate.buildingNo = req.body.buildingNo;
    if (req.body.floorNo !== undefined) locationUpdate.floorNo = req.body.floorNo;
    if (req.body.apartmentNo !== undefined)
      locationUpdate.apartmentNo = req.body.apartmentNo;
    if (req.body.buildingLockCode !== undefined)
      locationUpdate.buildingLockCode = req.body.buildingLockCode;
    if (req.body.securityGuardMobile !== undefined)
      locationUpdate.securityGuardMobile = req.body.securityGuardMobile;

    // Set the updated location object
    req.body.location = locationUpdate;

    // Remove the individual location properties from the root level
    delete req.body.buildingNo;
    delete req.body.floorNo;
    delete req.body.apartmentNo;
    delete req.body.buildingLockCode;
    delete req.body.securityGuardMobile;
  }
  Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
  await user.save();
  res.status(200).json({
    status: "success",
  });
});

// ADMIN ONLY
export const CreateUser = catchAsync(async (req, res, next) => {
  const body = filterBody(req.body, "name", "email", "password", "phoneNumber", "role");
  const user = await User.create(body);
  res.status(201).json({
    status: "success",
    message: `${req.body.role.toLowerCase()} created successfully`,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await User.deleteOne({ _id: req.params.id });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
