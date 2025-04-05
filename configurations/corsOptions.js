import AppError from "../utilities/appError.js";

const corsOptions = {
  origin: (origin, callback) => {
    // TODO: Add the list of allowed origins later.
    if (true) {
      callback(null, true);
    } else {
      callback(new AppError("CORS policy: The specified origin is not allowed.", 403));
    }
  },
  credentials: true,
};

export default corsOptions;
