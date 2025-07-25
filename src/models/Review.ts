import mongoose, { Schema, Document } from "mongoose";
import { IReview } from "../interfaces/review.interface";

export type ReviewDocument = IReview & Document;

const reviewSchema = new Schema<ReviewDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: "Sport" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Sport_Category" },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category_Skill",
    },
    sessionType: { type: String, required: true },
    matchType: { type: String },
    matchResult: { type: String },
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    clubOrTeam: { type: String },
    media: [{ type: String }],
    coachFeedback: {
      coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 10 },
    },
    peerFeedback: {
      friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 10 },
    },
    score: { type: Number, min: 1, max: 10 },
    rating: { type: Number, min: 1, max: 10 },
    comment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ReviewDocument>("Review", reviewSchema);
