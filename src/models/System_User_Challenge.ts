import mongoose, { Schema, Document } from "mongoose";
import { ISystemUserChallenge } from "../interfaces/systemUserChallenge.interface";

export type SystemUserChallengeDocument = ISystemUserChallenge & Document;

const systemUserChallengeSchema = new Schema<SystemUserChallengeDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: "System_Challenge",
      required: true,
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: "System_Challenge_Type",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Challenge_Category",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    submissions: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model<SystemUserChallengeDocument>(
  "System_User_Challenge",
  systemUserChallengeSchema
);
