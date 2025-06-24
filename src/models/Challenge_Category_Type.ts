import mongoose, { Schema, Document } from "mongoose";
import { IChallengeCategoryType } from "../interfaces/challengeCategoryType.interface";

export type ChallengeCategoryTypeDocument = IChallengeCategoryType & Document;

const challengeCategoryTypeSchema = new Schema<ChallengeCategoryTypeDocument>(
  {
    name: { type: String, required: true, trim: true },
    challengeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category",
      required: true,
    },
    rules: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<ChallengeCategoryTypeDocument>(
  "Challenge_Category_Type",
  challengeCategoryTypeSchema
);
