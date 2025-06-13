import mongoose, { Document, Schema } from "mongoose";
import { ISport } from "../interfaces/sport.interface";

export type SportDocument = ISport & Document;

const sportSchema = new Schema<SportDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sportsType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportsType",
      required: true,
    },
    skillLevelSet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SkillLevelSet",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<SportDocument>("Sport", sportSchema);
