import mongoose, { Schema, Document } from "mongoose";
import { IChallenge } from "../interfaces/challenge.interface";
import ChallengeCategory from "./Challenge_Category";

export type ChallengeDocument = IChallenge & Document;

const challengeSchema = new Schema<ChallengeDocument>(
  {
    name: { type: String, required: true, trim: true },
    gym: { type: String },
    frequency: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category",
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category_Type",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    media: {
      type: {
        type: String,
        enum: ["photo", "video"],
      },
      url: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ChallengeDocument>("Challenge", challengeSchema);
