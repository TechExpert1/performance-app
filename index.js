import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db.js";

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
console.log("object");
app.get("/", async (req, res) => {
  res.status(200).json({ message: "hello" });
});

app.listen(PORT);
