import { UserPerformanceExerciseController } from "./controllers/userPerformanceExercise";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import sportsTypeRoutes from "./routes/sportsType.js";
import trainingCalendarRoutes from "./routes/trainingCalander.js";
import reviewRoutes from "./routes/review.js";
import attendanceGoalRoutes from "./routes/attendanceGoal.js";
import challengeRoutes from "./routes/challenge.js";
import challengeCategoryRoutes from "./routes/challengeCategory.js";
import systemChallengeTypeRoutes from "./routes/systemChallengeType.js";
import userChallengeRoutes from "./routes/userChallenges.js";
import customerSupportRoutes from "./routes/customerSupport.js";
import physicalPerformanceRoutes from "./routes/physicalPerformance.js";
import systemUserChallengeRoutes from "./routes/systemUserChallenge.js";
import landingPageRoutes from "./routes/landingPage.js";
import communityRoutes from "./routes/community.js";
import coachRoutes from "./routes/coach.js";
import adminRoutes from "./routes/admin.js";
import subAdminRoutes from "./routes/salesRep.js";
import dropdownRoutes from "./routes/dropdown.js";
import dropdownDataRoutes from "./routes/dropdownData.js";
import userSportRoutes from "./routes/userSportCategory.js";
import chatRoutes from "./routes/chat.js";
import userSubscriptionRoutes from "./routes/userSubscription.js";
import UserPerformanceExerciseRoutes from "./routes/userPerformanceExercise.js";
import journalRoutes from "./routes/journal.js";
import feedbackRequestRoutes from "./routes/feedbackRequest.js";
import { registerSocketHandlers } from "./webSocket/socket.js";
import "./models/index.js";
// import "./cronJobs/trainingCalander.js";
dotenv.config();

const app = express();
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
app.use(bodyParser.json());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
  })
);
const apiLimiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 200,
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

connectDB();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(apiLimiter);

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/sports-types", sportsTypeRoutes);
app.use("/user-sports", userSportRoutes);
app.use("/reviews", reviewRoutes);
app.use("/communities", communityRoutes);
app.use("/training-calander", trainingCalendarRoutes);
app.use("/attendance-goals", attendanceGoalRoutes);
app.use("/challenges", challengeRoutes);
app.use("/challenge-categories", challengeCategoryRoutes);
app.use("/user-performance-exercises", UserPerformanceExerciseRoutes);
app.use("/system-challenge-types", systemChallengeTypeRoutes);
app.use("/user-challenges", userChallengeRoutes);
app.use("/customer-support", customerSupportRoutes);
app.use("/landing-page", landingPageRoutes);
app.use("/physical-performances", physicalPerformanceRoutes);
app.use("/system-user-challenges", systemUserChallengeRoutes);
app.use("/coaches", coachRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/sub-admin", subAdminRoutes);
app.use("/dropdowns", dropdownRoutes);
app.use("/dropdown-data", dropdownDataRoutes);
app.use("/user-subscriptions", userSubscriptionRoutes);
app.use("/chats", chatRoutes);
app.use("/journals", journalRoutes);
app.use("/feedback-requests", feedbackRequestRoutes);

// Global error handler middleware (must be after all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  
  // If response already sent, skip
  if (res.headersSent) {
    return next(err);
  }

  // Default to 500 server error
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.name === "ValidationError") {
    statusCode = 422;
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// app.listen(PORT);
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
registerSocketHandlers(io);
server.listen(PORT);
