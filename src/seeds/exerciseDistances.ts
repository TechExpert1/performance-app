import mongoose from "mongoose";
import dotenv from "dotenv";
import ChallengeCategoryExercise from "../models/Challenge_Category_Exercise.js";

dotenv.config();

// Map exercise names to their distance values
const exerciseDistances: Record<string, string> = {
  // === SPEED - Linear Sprint Tests ===
  "Sprint 20m": "20m",
  "Sprint 40m": "40m",
  "Sprint 60m": "60m",
  "Curve Sprint": "20m", // typical curve sprint distance
  "Sled Sprint": "20m", // typical sled sprint distance
  
  // === SPEED - Change of Direction & Agility Drills ===
  "5-10-5 Shuttle": "20m", // total distance covered
  "5-10-5 Shuttle Run": "20m", // duplicate with different name
  "T Test Agility Drill": "40m", // approximate total distance
  "L Drill": "15m", // approximate total distance
  "Illinois Agility Test": "60m", // approximate total distance
  "Arrowhead Drill": "15m", // approximate total distance

  // === ENDURANCE - Running / Jogging ===
  "1km Run": "1km",
  "2km Run": "2km",
  "3km Run": "3km",
  "5km Run": "5km",
  "10km Run": "10km",
  "Half Marathon": "21.1km",
  "Marathon": "42.2km",
  "VO₂ Max Run": "2.4km", // common 1.5 mile test

  // === ENDURANCE - Cycling ===
  "5km Ride": "5km",
  "10km Ride": "10km",
  "20km Ride": "20km",
  "40km Ride": "40km",
  "50km Ride": "50km",
  "100km Ride": "100km",

  // === ENDURANCE - Rowing ===
  "500m Row": "500m",
  "1000m Row": "1000m",
  "2000m Row": "2000m",
  "5km Row": "5km",
  "10km Row": "10km",
  "Half Marathon Row": "21.1km",

  // === ENDURANCE - Swimming ===
  "100m Swim": "100m",
  "200m Swim": "200m",
  "500m Swim": "500m",
  "1000m Swim": "1000m",
  "1500m Swim": "1500m",
  "1900m Swim": "1900m",
  "3800m Swim": "3800m",

  // === ENDURANCE - Assault Bike ===
  "2km Assault Bike": "2km",
  "5km Assault Bike": "5km",
  "10km Assault Bike": "10km",

  // === ENDURANCE - SkiErg ===
  "250m Ski": "250m",
  "500m Ski": "500m",
  "1000m Ski": "1000m",
  "2000m Ski": "2000m",
  "5km Ski": "5km",

  // === STRENGTH - Grip Strength & Forearm Endurance (Carries) ===
  "10m Farmers Carry": "10m",
  "10m Suitcase Carry": "10m",
};

const seedExerciseDistances = async () => {
  try {
    const connectionString = process.env.MONGO_DB_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error("MONGO_DB_CONNECTION_STRING is not defined in environment variables.");
    }
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");

    let updated = 0;
    let notFound = 0;

    for (const [name, distance] of Object.entries(exerciseDistances)) {
      const result = await ChallengeCategoryExercise.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { $set: { distance } },
        { new: true }
      );

      if (result) {
        console.log(`✅ Updated: ${name} -> distance: ${distance}`);
        updated++;
      } else {
        console.log(`❌ Not found: ${name}`);
        notFound++;
      }
    }

    console.log(`\n========== Summary ==========`);
    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);
    console.log(`Total exercises with distance: ${Object.keys(exerciseDistances).length}`);

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding exercise distances:", error);
    process.exit(1);
  }
};

seedExerciseDistances();
