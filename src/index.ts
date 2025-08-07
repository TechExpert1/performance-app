import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import sportsTypeRoutes from "./routes/sportsType.js";
import trainingCalendarRoutes from "./routes/trainingCalander.js";
import reviewRoutes from "./routes/review.js";
import attendanceGoalRoutes from "./routes/attendanceGoal.js";
import challengeRoutes from "./routes/challenge.js";
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
import chatRoutes from "./routes/chat.js";
import userSubscriptionRoutes from "./routes/userSubscription.js";
import { createRecurringSession, webhook } from "./config/stripe.js";
import { userAuth } from "./middlewares/user.js";
import { sendEmail } from "./config/awsConfig.js";
import "./models/index.js";
// import "./cronJobs/trainingCalander.js";
dotenv.config();

const app = express();
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
app.post("/webhook", express.raw({ type: "application/json" }), webhook);
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
app.use("/reviews", reviewRoutes);
app.use("/communities", communityRoutes);
app.use("/training-calander", trainingCalendarRoutes);
app.use("/attendance-goals", attendanceGoalRoutes);
app.use("/challenges", challengeRoutes);
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
app.use("/user-subscriptions", userSubscriptionRoutes);
app.use("/chats", chatRoutes);
app.post("/create-checkout-session", userAuth, createRecurringSession);
app.get("/user-notifications", userAuth, createRecurringSession);
app.listen(PORT);
