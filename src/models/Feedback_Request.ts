import mongoose, { Schema, Document } from "mongoose";
import { IFeedbackRequest } from "../interfaces/feedbackRequest.interface.js";

export type FeedbackRequestDocument = IFeedbackRequest & Document;

const feedbackRequestSchema = new Schema<FeedbackRequestDocument>(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    skills: [
      {
        skillId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "skills.skillModel",
        },
        skillModel: {
          type: String,
          required: true,
          enum: ["Sport_Category_Skill", "User_Sport_Category_Skill"],
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "declined"],
      default: "pending",
      index: true,
    },
    type: {
      type: String,
      enum: ["peer", "coach"],
      required: true,
    },
    requestMessage: { type: String },
    feedbackRating: {
      type: Number,
      min: 1,
      max: 10,
    },
    feedbackComment: { type: String },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
feedbackRequestSchema.index({ recipient: 1, status: 1, createdAt: -1 });
feedbackRequestSchema.index({ requester: 1, status: 1, createdAt: -1 });

export default mongoose.model<FeedbackRequestDocument>(
  "FeedbackRequest",
  feedbackRequestSchema
);
