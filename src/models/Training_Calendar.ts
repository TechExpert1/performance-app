import mongoose, { Schema, Document } from "mongoose";
import { ITrainingCalendar } from "../interfaces/trainingCalander.interface";

export type TrainingCalendarDocument = ITrainingCalendar & Document;

const trainingCalendarSchema = new Schema<TrainingCalendarDocument>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    trainingName: { type: String },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
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
    trainingScope: { type: String, enum: ["self", "gym"], default: "self" },
    date: { type: Date },
    startTime: { type: String },
    finishTime: { type: String },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym" },
    recurrence: {
      type: String,
      enum: ["weekly", "monthly", "none", null, ""],
      default: null
    },
    recurrenceEndDate: { type: Date },
    recurrenceStatus: {
      type: String,
      enum: ["active", "in-active", "inactive"],
      default: "in-active",
    },
    numberOfOccurences: { type: Number, min: 1 }, // Number of occurrences for recurring trainings
    occurrencePeriod: { type: Number, min: 1 }, // Which occurrence this is (1, 2, 3...) in a recurring series
    numberOfWeeks: { type: Number, min: 1 }, // Deprecated: use numberOfOccurences
    numberOfMonths: { type: Number, min: 1 }, // Deprecated: use numberOfOccurences
    trainings: [
      {
        period: { type: Number, required: true }, // Occurrence number (1, 2, 3...)
        categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sport_Category" }],
        skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sport_Category_Skill" }],
      },
    ],
    weeklySkills: [
      {
        period: { type: Number, required: true }, // Deprecated: use trainings
        skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sport_Category_Skill" }],
      },
    ],
    monthlySkills: [
      {
        period: { type: Number, required: true }, // Deprecated: use trainings
        skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sport_Category_Skill" }],
      },
    ],
    classLimit: {
      type: Number,
      min: 1,
      default: null,
    },
    note: { type: String },
    parentTrainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training_Calendar",
      default: null
    },
    isRecurringInstance: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

export default mongoose.model<TrainingCalendarDocument>(
  "Training_Calendar",
  trainingCalendarSchema
);
