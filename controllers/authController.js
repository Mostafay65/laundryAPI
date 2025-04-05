import User from "../models/userModel.js";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";
import sendTokenResponse, { signToken } from "../utilities/sendTokenResponse.js";
import filterBody from "../utilities/filterBody.js";
import crypto from "crypto";
import Email from "../services/emailService.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import mongoose from "mongoose";
import httpStatusText from "../helpers/httpStatusText.js";
import googleService from "../services/googleService.js";

export const signup = catchAsync(async (req, res, next) => {
  // Start a session and transaction.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const filteredBody = filterBody(req.body, "name", "email", "phoneNumber", "password");

    const user = await User.create([filteredBody], { session });

    // const verificationCode = user[0].createVerificationCode();
    // await user[0].save({ validateBeforeSave: false });

    // try {
    // await new Email(user[0], verificationCode).sendVerify();
    // } catch {
    //   return next(new AppError("Email sending failed. Please try again later.", 500));
    // }

    // Commit transaction.
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      message: "User signed up!",
    });
  } catch (err) {
    // Abort transaction
    await session.abortTransaction();
    session.endSession();

    return next(err);
  }
});

export const resendVerificationCode = catchAsync(async (req, res, next) => {
  return next(new AppError("Waiting for developing mobile messaging service ", 400));
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User with this email address is not found.", 404));
  }

  const verificationCode = user.createVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user, verificationCode).sendVerify();

    res.status(201).json({
      status: httpStatusText.SUCCESS,
      message: "Verification code sent to email.",
    });
  } catch {
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Email sending failed. Please try again later.", 500));
  }
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  if (!req.params.code) {
    return next(new AppError("Verification code is required.", 400));
  }

  const { email } = req.body;
  if (!email) return next(new AppError("Email is required.", 400));
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User with this email address is not found.", 404));
  }

  const hashedCode = crypto.createHash("sha256").update(req.params.code).digest("hex");

  if (user.verificationCode !== hashedCode || user.verificationCodeExpires < Date.now()) {
    return next(new AppError("Verification code is invalid.", 400));
  }

  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  user.emailStatus = "verified";

  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, "Email verified successfully.");
});

export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError("Invalid email or password.", 401));
  }

  // if (user.emailStatus === "awaitingVerification") {
  //   return next(
  //     new AppError(
  //       "Your email is not verified. Please check your email for the verification link.",
  //       403
  //     )
  //   );
  // }

  sendTokenResponse(user, 200, res);
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const { jwt: refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(
      new AppError("Session expired or invalid. Please log in to continue.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decoded.id);

  const accessToken = signToken(
    {
      userInfo: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_EXPIRES_IN
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    accessToken,
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.correctPassword(req.body.currentPassword))) {
    return next(new AppError("Password is incorrect.", 401));
  }

  user.password = req.body.password;
  await user.save();

  // await new Email(user).sendNotifyPasswordChange();

  sendTokenResponse(user, 200, res);
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address.", 404));
  }

  const resetCode = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user, resetCode).sendPasswordReset();

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Code has been sent to your email.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There is an error sending the email. Try again later.", 500)
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  if (!req.params.code) {
    return next(new AppError("Code is required.", 400));
  }
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User with this email address is not found.", 404));
  }

  const hashedToken = crypto.createHash("sha256").update(req.params.code).digest("hex");

  if (user.passwordResetToken !== hashedToken || user.passwordResetExpires < Date.now()) {
    return next(new AppError("Code is invalid.", 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

export const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: "Already logged out",
    });
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(204).send(null);
};
