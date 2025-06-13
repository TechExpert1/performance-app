import mongoose from "mongoose";
import Sport_Type from "./models/Sport_Type.js"; // adjust path if needed
import Sport from "./models/Sport.js";

const sportsData = [
  {
    type: "Team Sports",
    sports: [
      "Football",
      "Aussie Rules Football",
      "Cricket",
      "Rugby league",
      "Rugby union",
    ],
  },
  {
    type: "Combat Sports",
    sports: [
      "Brazilian Jiu-Jitsu (BJJ)",
      "Boxing",
      "Muay Thai",
      "Padel",
      "Tennis",
    ],
  },
  {
    type: "Strength Sports",
    sports: ["Weightlifting", "Reformer Pilates", "Yoga"],
  },
];

export const seedSports = async () => {
  try {
    await Sport_Type.deleteMany({});
    await Sport.deleteMany({});

    for (const category of sportsData) {
      const sportsType = await Sport_Type.create({ name: category.type });

      const sports = category.sports.map((sportName) => ({
        name: sportName,
        sportType: sportsType._id,
        skillLevelSet: "684824d982327d8da0648a48",
      }));

      await Sport.insertMany(sports);
    }

    console.log("✅ Sports and sports types seeded successfully.");
  } catch (err) {
    console.error("❌ Error seeding sports:", err);
  } finally {
    mongoose.connection.close();
  }
};
// {
//   "name": "Belt Levels",
//   "levels": ["Blue", "Purple", "Brown", "Black"]
// }
// {
//   "name": "Standard Levels",
//   "levels": ["Beginner", "Intermediate", "Master"]
// }
