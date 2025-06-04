import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
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

app.listen(PORT);
