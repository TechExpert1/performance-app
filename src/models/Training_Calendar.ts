import mongoose, { Schema, Document } from "mongoose";
import { ITrainingCalendar } from "../interfaces/trainingCalander.interface";

export type TrainingCalendarDocument = ITrainingCalendar & Document;

const trainingCalendarSchema = new Schema<TrainingCalendarDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    trainingName: { type: String, required: true },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category",
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category_Skill",
      required: true,
    },
    trainingScope: { type: String, enum: ["self", "gym"], default: "self" },
    date: { type: Date, required: true },
    recurrence: { type: String, enum: ["weekly", "monthly"], default: null },
    recurrenceEndDate: { type: Date },
    recurrenceStatus: {
      type: String,
      enum: ["active", "in-active"],
      default: "in-active",
    },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<TrainingCalendarDocument>(
  "Training_Calendar",
  trainingCalendarSchema
);
