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
      users: await User.find(),
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

  // console.log(req);
  if (req.body.email && !userRoleAdmin)
    return next(new AppError("Email cannot be updated", 400));
  if (req.body.password && !userRoleAdmin)
    return next(new AppError("This route is not for password update.", 400));

  req.body = filterBody(
    req.body,
    "name",
    "email",
    "password",
    "phoneNumber",
    "bio",
    // "location",
    userRoleAdmin ? "role" : ""
  );
  const user = await User.findById(req.params.id);
  Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
  await user.save();
  res.status(200).json({
    status: "success",
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  await User.deleteOne({ _id: req.params.id });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
