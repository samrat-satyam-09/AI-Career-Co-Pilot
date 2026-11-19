import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

import errorMiddleware from "./middlewares/errorHandler";
import { generalLimiter } from "./middlewares/rateLimiter";

// Route imports
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import resumeRoutes from "./routes/resume.routes";
// import aiRoutes from "./routes/ai.routes";
// import applicationRoutes from "./routes/application.routes";
// import interviewRoutes from "./routes/interview.routes";
// import subscriptionRoutes from "./routes/subscription.routes";
// import planRoutes from "./routes/plan.routes";
// import couponRoutes from "./routes/coupon.routes";
// import notificationRoutes from "./routes/notification.routes";
// import adminRoutes from "./routes/admin.routes";

import passport from "passport";
import { configurePassport } from "./config/passport";

const app = express();

app.use(passport.initialize());
configurePassport();


// ────────────────────── Security Middleware ──────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Theme-Preference"],
  })
);
app.use(mongoSanitize());
app.use(hpp());

// ────────────────────── Body Parsing ──────────────────────
// IMPORTANT: Razorpay webhook needs raw body — mount BEFORE json middleware
// app.use("/api/v1/subscriptions/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ────────────────────── Logging & Compression ──────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use(compression());

// ────────────────────── Rate Limiting ──────────────────────
app.use("/api/", generalLimiter);

// ────────────────────── Health Check ──────────────────────
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "AI Career Co-Pilot API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
  });
});

// ────────────────────── API Routes ──────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/resumes", resumeRoutes);
// app.use("/api/v1/ai", aiRoutes);
// app.use("/api/v1/applications", applicationRoutes);
// app.use("/api/v1/interviews", interviewRoutes);
// app.use("/api/v1/subscriptions", subscriptionRoutes);
// app.use("/api/v1/plans", planRoutes);
// app.use("/api/v1/coupons", couponRoutes);
// app.use("/api/v1/notifications", notificationRoutes);
// app.use("/api/v1/admin", adminRoutes);

// ────────────────────── 404 Handler ──────────────────────
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ────────────────────── Error Middleware (must be last) ──────────────────────
app.use(errorMiddleware);

export default app;
