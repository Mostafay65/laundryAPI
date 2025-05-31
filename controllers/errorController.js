import AppError from "../utilities/appError.js";
import httpStatusText from "../helpers/httpStatusText.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const value = error.errorResponse.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate value "${value}". Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((el) => el.properties.message);
  const message = `Invalid input data: ${errors.join(" ")}`;
  return new AppError(message, 400);
};

const handleJTWError = () =>
  new AppError("Invalid access token. Please log in again.", 401);

const handleJWTExpiredError = (req) => {
  if (req.cookies && req.cookies.jwt) {
    return new AppError(
      "Your token has expired. Please refresh your token to get a new access token.",
      401
    );
  }
  return new AppError("Your token has expired. Please log in again.", 401);
};

const handleStripeError = (error) => new AppError(error.message, error.statusCode);

const handleFileSizeLimitError = () =>
  new AppError("File size exceeds the limit of 1MB!", 400);

const handelFileFormateError = (error) => new AppError(error.message, 400);

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log error
    console.error("Error💥: " + err);

    res.status(500).json({
      status: httpStatusText.ERROR,
      message: "Something went very wrong!",
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const globalErrorHandler = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(err);
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);
    // Database errors
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);

    // JWT errors
    if (error.name === "JsonWebTokenError") error = handleJTWError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError(req);

    if (error.code === "LIMIT_FILE_SIZE") error = handleFileSizeLimitError();

    if (error.http_code === 400) error = handelFileFormateError(error);

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
