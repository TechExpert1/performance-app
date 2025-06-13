import mongoose, { Document, Schema } from "mongoose";
import { ISportsType } from "../interfaces/sportsType.interface";

type SportsTypeDocument = ISportsType & Document;

const sportsTypeSchema = new Schema<SportsTypeDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Sport_Type = mongoose.model<SportsTypeDocument>(
  "Sport_Type",
  sportsTypeSchema
);

export default Sport_Type;
