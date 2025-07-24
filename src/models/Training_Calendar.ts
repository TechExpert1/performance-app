import mongoose, { Schema, Document } from "mongoose";
import { ITrainingCalendar } from "../interfaces/trainingCalander.interface";

export type TrainingCalendarDocument = ITrainingCalendar & Document;

const trainingCalendarSchema = new Schema<TrainingCalendarDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    coaches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    trainingName: { type: String },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category",
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport_Category_Skill",
    },
    trainingScope: { type: String, enum: ["self", "gym"], default: "self" },
    date: { type: Date },
    startTime: { type: String },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym" },
    finishTime: { type: String },
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
