import mongoose, { Schema, Document } from "mongoose";
import { ISystemChallenge } from "../interfaces/systemChallenge.interface";

export type SystemChallengeDocument = ISystemChallenge & Document;

const levelSchema = new Schema(
  {
    badge: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const systemChallengeSchema = new Schema<SystemChallengeDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    coachTip: { type: String },
    levels: { type: [levelSchema], default: [] },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category",
      required: true,
    },
    format: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category_Format",
    },
    categoryType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "System_Challenge_Type",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<SystemChallengeDocument>(
  "System_Challenge",
  systemChallengeSchema
);
