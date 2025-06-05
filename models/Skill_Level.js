import mongoose from "mongoose";

const skillLevelSetSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'Standard Levels', 'Belt Levels'
  levels: [{ type: String, required: true }], // e.g., ['Beginner', 'Intermediate', 'Master']
});

export default mongoose.model("SkillLevelSet", skillLevelSetSchema);
