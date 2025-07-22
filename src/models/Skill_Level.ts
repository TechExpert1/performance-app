import mongoose, { Document, Schema } from "mongoose";
import { ISkillLevelSet } from "../interfaces/skillLevelSet.interface";

type SkillLevelSetDocument = ISkillLevelSet & Document;

// Define the schema for each level object
const levelSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true }, // Optional? set required: false if needed
  },
  { _id: false } // Prevents automatic _id generation for subdocuments
);

// Main schema for skill level set
const skillLevelSetSchema = new Schema<SkillLevelSetDocument>(
  {
    name: { type: String, required: true, unique: true },
    levels: { type: [levelSchema], required: true },
    description: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const Skill_Level_Set = mongoose.model<SkillLevelSetDocument>(
  "Skill_Level_Set",
  skillLevelSetSchema
);

export default Skill_Level_Set;
