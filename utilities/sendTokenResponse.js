import jwt from "jsonwebtoken";
import httpStatusText from "../helpers/httpStatusText.js";

export const signToken = (data, secretKey, expiresIn) => {
  return jwt.sign({ ...data }, secretKey, {
    expiresIn,
  });
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const accessToken = signToken(
    {
      userInfo: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_EXPIRES_IN
  );
  const refreshToken = signToken(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    process.env.REFRESH_TOKEN_EXPIRES_IN
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    status: httpStatusText.SUCCESS,
    message,
    accessToken,
  });
};

export default sendTokenResponse;
