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
      ref: "Sport_Type",
      required: true,
    },
    skillLevelSet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill_Level_Set",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<SportDocument>("Sport", sportSchema);
