import mongoose, { Schema, Document } from "mongoose";
import { IJournal, IFeedback } from "../interfaces/journal.interface.js";

export type JournalDocument = IJournal & Document;

const feedbackSchema = new Schema<IFeedback>(
  {
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
  },
  { timestamps: true, _id: false }
);

const journalSchema = new Schema<JournalDocument>(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    date: { 
      type: Date, 
      required: true,
      index: true 
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      index: true
    },
    sessionType: { 
      type: String,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category",
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport_Category",
      },
    ],
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category_Skill",
    },
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport_Category_Skill",
      },
    ],
    startTime: { type: String },
    finishTime: { type: String },
    trainingCalendar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training_Calendar",
    },
    personalFeedback: feedbackSchema,
    peerFeedback: feedbackSchema,
    coachFeedback: feedbackSchema,
    videoUrl: { type: String },
    videoThumbnail: { type: String },
    reviewScore: { 
      type: Number, 
      min: 0, 
      max: 10,
      index: true
    },
    isPublic: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

// Index for efficient filtering
journalSchema.index({ user: 1, date: -1 });
journalSchema.index({ user: 1, sport: 1, date: -1 });
journalSchema.index({ user: 1, reviewScore: 1 });

export default mongoose.model<JournalDocument>("Journal", journalSchema);
