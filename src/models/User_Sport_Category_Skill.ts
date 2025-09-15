import mongoose, { Schema, Document, Types } from "mongoose";

// Interface
export interface IUserSportCategorySkill {
  name: string;
  category: Types.ObjectId; // Refers to User_Sport_Category
  createdAt?: Date;
  updatedAt?: Date;
}

// Document type
export type UserSportCategorySkillDocument = IUserSportCategorySkill & Document;

// Schema
const userSportCategorySkillSchema = new Schema<UserSportCategorySkillDocument>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Sport_Category",
      required: true,
    },
  },
  { timestamps: true }
);

// Model
export default mongoose.model<UserSportCategorySkillDocument>(
  "User_Sport_Category_Skill",
  userSportCategorySkillSchema
);
