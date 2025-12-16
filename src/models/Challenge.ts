import mongoose, { Schema, Document } from "mongoose";
import { IChallenge } from "../interfaces/challenge.interface";

export type ChallengeDocument = IChallenge & Document;

const dailySubmissionSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date },
    time: { type: String },
    reps: { type: String },
    distance: { type: String },
    weight: { type: String },
    calories: { type: String },
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

const challengeSchema = new Schema<ChallengeDocument>(
  {
    name: { type: String, required: true, trim: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    time: { type: String },
    distance: { type: String },
    sessionGoals: { type: String },
    completionCount: {
      type: String,
    },
    duration: { type: String, trim: true },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category_Exercise",
    },
    format: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category_Format",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    mediaUrl: { type: String },
    requiredVideo: { type: Boolean, defualt: 0 },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dailySubmissions: {
      type: [dailySubmissionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ChallengeDocument>("Challenge", challengeSchema);
// time (strenght,power),distance(endurance)
