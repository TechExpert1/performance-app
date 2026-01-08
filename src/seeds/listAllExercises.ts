import mongoose from "mongoose";
import dotenv from "dotenv";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";
import ChallengeCategory from "../models/Challenge_Category.js";
import { ChallengeSubCategory } from "../models/Challenge_Sub_Category.js";

dotenv.config();

const listAllExercises = async () => {
  try {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("MONGO_DB_CONNECTION_STRING is not defined in environment variables.");
    }
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB\n");

    const exercises = await ChallengeCategoryExercise.find({})
      .select("name challengeCategory subCategory distance time")
      .sort({ name: 1 })
      .lean();

    console.log(`Total exercises: ${exercises.length}\n`);
    
    // Group by presence of distance or time
    const withDistance = exercises.filter((ex: any) => ex.distance);
    const withTime = exercises.filter((ex: any) => ex.time);
    const withNeither = exercises.filter((ex: any) => !ex.distance && !ex.time);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`EXERCISES WITH DISTANCE (${withDistance.length})`);
    console.log(`${"=".repeat(60)}`);
    withDistance.forEach((ex: any) => {
      console.log(`  - ${ex.name} [distance: ${ex.distance}]`);
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log(`EXERCISES WITH TIME (${withTime.length})`);
    console.log(`${"=".repeat(60)}`);
    withTime.forEach((ex: any) => {
      console.log(`  - ${ex.name} [time: ${ex.time}]`);
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log(`EXERCISES WITHOUT DISTANCE OR TIME (${withNeither.length})`);
    console.log(`${"=".repeat(60)}`);
    withNeither.forEach((ex: any) => {
      console.log(`  - ${ex.name}`);
    });

    await mongoose.disconnect();
    console.log("\n\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error listing exercises:", error);
    process.exit(1);
  }
};

listAllExercises();
