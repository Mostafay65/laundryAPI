import whatsAppService from "../services/WhatsAppService.js";
import catchAsync from "../utilities/catchAsync.js";
import httpStatusText from "../helpers/httpStatusText.js";

/**
 * Initialize WhatsApp session.
 */
export const initializeSession = catchAsync(async (req, res, next) => {
  await whatsAppService.initialize();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "WhatsApp session initialized successfully.",
  });
});
