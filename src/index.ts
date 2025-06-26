import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import sportsTypeRoutes from "./routes/sportsType.js";
import skillLevelRoutes from "./routes/skillLevel.js";
import trainingCalendarRoutes from "./routes/trainingCalander.js";
import reviewRoutes from "./routes/review.js";
import attendanceGoalRoutes from "./routes/attendanceGoal.js";
import challengeRoutes from "./routes/challenge.js";
import userChallengeRoutes from "./routes/userChallenges.js";
import customerSupportRoutes from "./routes/customerSupport.js";
import "./models/index.js";
// import "./cronJobs/trainingCalander.js";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
  })
);
connectDB();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/sports-types", sportsTypeRoutes);
app.use("/skill-levels", skillLevelRoutes);
app.use("/reviews", reviewRoutes);
app.use("/training-calander", trainingCalendarRoutes);
app.use("/attendance-goals", attendanceGoalRoutes);
app.use("/challenges", challengeRoutes);
app.use("/user-challenges", userChallengeRoutes);
app.use("/customer-support", customerSupportRoutes);

app.listen(PORT);
