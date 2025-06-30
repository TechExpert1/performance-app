import mongoose, { Schema, Document } from "mongoose";
import { ISystemChallengeType } from "../interfaces/systemChallengeType.interface";

export type SystemChallengeTypeDocument = ISystemChallengeType & Document;

const systemChallengeTypeSchema = new Schema<SystemChallengeTypeDocument>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<SystemChallengeTypeDocument>(
  "System_Challenge_Type",
  systemChallengeTypeSchema
);
