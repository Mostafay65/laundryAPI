import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import corsOptions from "./configurations/corsOptions.js";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utilities/appError.js";
import authRouter from "./routes/authRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import branchRouter from "./routes/branchRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import bannerRouter from "./routes/bannerRoutes.js";
import whatsAppRouter from "./routes/whatsAppRoutes.js";
import settingsRouter from "./routes/settingsRoutes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const app = express();

app.use(cors(corsOptions));
app.use(cookieParser());

// Server static files
app.use("/uploads", express.static(join(__dirname, "uploads")));

// Body parser
app.use(express.json());

// Routes
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/items", itemRouter);
app.use("/orders", orderRouter);
app.use("/branches", branchRouter);
app.use("/notifications", notificationRouter);
app.use("/banners", bannerRouter);
app.use("/whatsapp", whatsAppRouter);
app.use("/settings", settingsRouter);

// Undefined routes
app.all("/", (req, res, next) => {
  next(new AppError(`Can not find ${req.originalUrl} on this server.`, 404));
});

// Manage all errors
app.use(globalErrorHandler);
