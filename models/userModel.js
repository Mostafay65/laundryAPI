import mongoose, { Schema } from "mongoose";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcrypt";
import roles from "../helpers/roles.js";
import LocationSchema from "./locationModel.js";

const baseOptions = {
  discriminatorKey: "role", // Key to differentiate models
  collection: "User", // All models use the same collection
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address."],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required."],
      validate: [validator.isMobilePhone, "Please provide a valid phone number."],
    },
    bio: String,
    profilePicture: String,
    location: {
      type: LocationSchema,
    },
    role: {
      type: [String],
      enum: {
        values: Object.values(roles),
        message: `Role is either: ${Object.values(roles).join(", ")}.`,
      },
      default: [roles.user],
    },
    emailStatus: {
      type: String,
      enum: {
        values: ["verified", "awaitingVerification"],
        message: "Status is either: verified, awaitingVerification.",
      },
      default: "awaitingVerification",
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters."],
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  baseOptions
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// METHODS

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  // FALSE means NOT changed.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetCode = Math.floor(1000 + Math.random() * 9000);

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetCode.toString())
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetCode;
};

userSchema.methods.createVerificationCode = function () {
  const verificationCode = Math.floor(1000 + Math.random() * 9000);

  this.verificationCode = crypto
    .createHash("sha256")
    .update(verificationCode.toString())
    .digest("hex");
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;

  return verificationCode;
};

const User = mongoose.model("User", userSchema);

export default User;
