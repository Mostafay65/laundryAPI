import jwt from "jsonwebtoken";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";
import { promisify } from "util";
import User from "../models/userModel.js";

const authorize = (...allowedRoles) =>
  catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);

    const currentUser = await User.findById(decoded.userInfo.id);

    // Check if user has deleted his account.
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token is no longer exist.", 401)
      );
    }

    // Check if user has changed his password after the token is issued.
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password! Please log in again.", 401)
      );
    }

    // Check if email got verified.
    // if (currentUser.emailStatus !== "verified") {
    //   return next(new AppError("Your email is not verified yet!.", 403));
    // }

    if (allowedRoles.length !== 0 && !currentUser.role.some((role) => allowedRoles.includes(role))) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }


    req.user = currentUser;
    next();
  });

export default authorize;
