import mongoose, { Schema, Document } from "mongoose";
import { ISportCategorySkill } from "../interfaces/sportCategorySkill.interface";

export type SportCategorySkillDocument = ISportCategorySkill & Document;

const sportCategorySkillSchema = new Schema<SportCategorySkillDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    coachTip: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<SportCategorySkillDocument>(
  "Sport_Category_Skill",
  sportCategorySkillSchema
);
