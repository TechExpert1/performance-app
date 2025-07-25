import mongoose, { Schema, Document } from "mongoose";
import { IChallengeCategoryTypeFormat } from "../interfaces/challengeCategoryTypeFormat.interface";

export type ChallengeCategoryTypeFormatDocument = IChallengeCategoryTypeFormat &
  Document;

const challengeCategoryTypeFormatSchema =
  new Schema<ChallengeCategoryTypeFormatDocument>(
    {
      name: { type: String, required: true, trim: true },
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge_Category",
      },
      type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge_Category_Type",
        required: true,
      },
    },
    { timestamps: true }
  );

export default mongoose.model<ChallengeCategoryTypeFormatDocument>(
  "Challenge_Category_Type_Format",
  challengeCategoryTypeFormatSchema
);
