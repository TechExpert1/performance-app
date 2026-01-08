import mongoose from "mongoose";
import dotenv from "dotenv";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";

dotenv.config();

const findTimeBasedExercises = async () => {
  try {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("MONGO_DB_CONNECTION_STRING is not defined in environment variables.");
    }
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB\n");

    // Search for exercises that might be time-based
    const patterns = [
      /minute/i,
      /calories/i,
      /metres/i,
      /time/i,
      /reps in/i,
      /max .* in/i
    ];

    for (const pattern of patterns) {
      const exercises = await ChallengeCategoryExercise.find({
        name: { $regex: pattern }
      }).select("name distance time").lean();
      
      if (exercises.length > 0) {
        console.log(`\nPattern: ${pattern}`);
        console.log("=".repeat(60));
        exercises.forEach((ex: any) => {
          const meta = [];
          if (ex.distance) meta.push(`distance: ${ex.distance}`);
          if (ex.time) meta.push(`time: ${ex.time}`);
          const metaStr = meta.length > 0 ? ` [${meta.join(", ")}]` : "";
          console.log(`  - "${ex.name}"${metaStr}`);
        });
      }
    }

    await mongoose.disconnect();
    console.log("\n\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

findTimeBasedExercises();
