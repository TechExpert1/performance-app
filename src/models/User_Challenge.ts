import mongoose, { Schema, Document } from "mongoose";
import { IUserChallenge } from "../interfaces/userChallenge.interface";

export type UserChallengeDocument = IUserChallenge & Document;

const dailySubmissionSchema = new Schema(
  {
    date: { type: Date },
    time: { type: String },
    reps: { type: String },
    distance: { type: String },
    mediaUrl: { type: String },
    ownerApprovalStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    note: { type: String },
  },
  { timestamps: true }
);

const userChallengeSchema = new Schema<UserChallengeDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      required: true,
    },
    dailySubmissions: {
      type: [dailySubmissionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<UserChallengeDocument>(
  "User_Challenge",
  userChallengeSchema
);
