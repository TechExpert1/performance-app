import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import sportsTypeRoutes from "./routes/sportsType.js";
import skillLevelRoutes from "./routes/skillLevel.js";
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

app.use("/auth", authRoutes);
app.use("/sports-types", sportsTypeRoutes);
app.use("/skill-levels", skillLevelRoutes);

app.listen(PORT);
