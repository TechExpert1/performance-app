import mongoose, { Document, Schema } from "mongoose";
import { ISkillLevelSet } from "../interfaces/skillLevelSet.interface";

type SkillLevelSetDocument = ISkillLevelSet & Document;

const skillLevelSetSchema = new Schema<SkillLevelSetDocument>({
  name: { type: String, required: true, unique: true },
  levels: [{ type: String, required: true }],
});

const Skill_Level_Set = mongoose.model<SkillLevelSetDocument>(
  "Skill_Level_Set",
  skillLevelSetSchema
);

export default Skill_Level_Set;
