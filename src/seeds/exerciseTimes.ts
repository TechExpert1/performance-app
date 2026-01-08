import mongoose from "mongoose";
import dotenv from "dotenv";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";

dotenv.config();

// Map exercise names to their time values
const exerciseTimes: Record<string, string> = {
  // === POWER - Barbell Power Pack (1 Minute Tests) ===
  "Jump Shrug – Reps in 1 Minute": "1 Minute",
  "High Pull – Reps in 1 Minute": "1 Minute",
  "Push Press – Reps in 1 Minute": "1 Minute",

  // === POWER - Kettlebell Power Pack (1 Minute Tests) ===
  "Kettlebell Swing Power Test": "1 Minute",
  "Kettlebell Clean & Press Challenge": "1 Minute",
  "Kettlebell Snatch Challenge": "1 Minute",
  "Kettlebell Thruster Challenge": "1 Minute",

  // === ENDURANCE - Rowing (Time-based Tests) ===
  "Max Metres in 20 Minutes": "20 Minutes",

  // === ENDURANCE - Assault Bike (Time-based Tests) ===
  "20 Calories for Time": "For Time", // "For Time" means as fast as possible
  "Max Calories in 10 Minutes": "10 Minutes",
  "Max Distance in 20 Minutes": "20 Minutes",

  // === ENDURANCE - SkiErg (Time-based Tests) ===
  "Max Metres in 10 Minutes": "10 Minutes",
};

const seedExerciseTimes = async () => {
  try {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("MONGO_DB_CONNECTION_STRING is not defined in environment variables.");
    }
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");

    let updated = 0;
    let notFound = 0;

    for (const [name, time] of Object.entries(exerciseTimes)) {
      const result = await ChallengeCategoryExercise.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { $set: { time } },
        { new: true }
      );

      if (result) {
        console.log(`✅ Updated: ${name} -> time: ${time}`);
        updated++;
      } else {
        console.log(`❌ Not found: ${name}`);
        notFound++;
      }
    }

    console.log(`\n========== Summary ==========`);
    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);
    console.log(`Total exercises with time: ${Object.keys(exerciseTimes).length}`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding exercise times:", error);
    process.exit(1);
  }
};

seedExerciseTimes();
