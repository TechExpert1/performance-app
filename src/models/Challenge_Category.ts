import mongoose, { Schema, Document } from "mongoose";
import { IChallengeCategory } from "../interfaces/challengeCategory.interface";

export type ChallengeCategoryDocument = IChallengeCategory & Document;

const challengeCategorySchema = new Schema<ChallengeCategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ChallengeCategoryDocument>(
  "Challenge_Category",
  challengeCategorySchema
);
