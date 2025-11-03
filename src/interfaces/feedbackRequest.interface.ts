import mongoose from "mongoose";

export interface IFeedbackRequest {
  requester: mongoose.Types.ObjectId; // User who requests feedback
  recipient: mongoose.Types.ObjectId; // User who will give feedback
  review: mongoose.Types.ObjectId; // Review/Journal entry
  sport: mongoose.Types.ObjectId;
  skills: {
    skillId: mongoose.Types.ObjectId;
    skillModel: string;
  }[];
  status: "pending" | "completed" | "declined";
  type: "peer" | "coach";
  requestMessage?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
