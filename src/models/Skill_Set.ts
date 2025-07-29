// src/models/skillSet.model.ts
import mongoose, { Schema, Document, Types } from "mongoose";

// ========================
// Skill Set Model (Main)
// ========================
export interface ISkillSet extends Document {
  name: string;
  description?: string;
}

const skillSetSchema = new Schema<ISkillSet>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const SkillSet = mongoose.model<ISkillSet>("Skill_Set", skillSetSchema);

// ========================
// Skill Set Level Model (Child)
// ========================
export interface ISkillSetLevel extends Document {
  name: string;
  image?: string;
  skillSet: Types.ObjectId;
}

const skillSetLevelSchema = new Schema<ISkillSetLevel>(
  {
    name: { type: String, required: true },
    image: { type: String, default: "" },
    skillSet: {
      type: Schema.Types.ObjectId,
      ref: "Skill_Set",
      required: true,
    },
  },
  { timestamps: true }
);

export const SkillSetLevel = mongoose.model<ISkillSetLevel>(
  "Skill_Set_Level",
  skillSetLevelSchema
);
