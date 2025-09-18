import mongoose, { Schema, Document } from "mongoose";
import { IReview } from "../interfaces/review.interface";

export type ReviewDocument = IReview & Document;

const reviewSchema = new Schema<ReviewDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: "Sport" },
    category: {
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "category.categoryModel",
      },
      categoryModel: {
        type: String,
        enum: ["Sport_Category", "User_Sport_Category"],
      },
    },
    skill: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "skill.skillModel",
        },
        skillModel: {
          type: String,
          required: true,
          enum: ["Sport_Category_Skill", "User_Sport_Category_Skill"],
        },
      },
    ],
    sessionType: { type: String, required: true },
    matchType: { type: String },
    matchResult: { type: String },
    opponent: { type: String },
    clubOrTeam: { type: String },
    media: [{ type: String }],
    coachFeedback: {
      coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 10 },
      comment: { type: String },
    },
    peerFeedback: {
      friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 10 },
      comment: { type: String },
    },
    private: { type: Boolean },
    score: { type: String },
    rating: { type: Number, min: 1, max: 10 },
    comment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ReviewDocument>("Review", reviewSchema);
