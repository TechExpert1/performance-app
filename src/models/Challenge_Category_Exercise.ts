import mongoose, { Schema, Document } from "mongoose";
import { IChallengeCategoryType } from "../interfaces/challengeCategoryType.interface";
import ChallengeCategoryTypeFormat from "./Challenge_Category_Format.js";
export type ChallengeCategoryTypeDocument = IChallengeCategoryType & Document;

const challengeCategoryTypeSchema = new Schema<ChallengeCategoryTypeDocument>(
  {
    name: { type: String, required: true, trim: true },
    entityType: { type: String },
    description: { type: String },
    coachTip: { type: String },
    challengeCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge_Sub_Category",
    },
  },
  { timestamps: true }
);

challengeCategoryTypeSchema.pre("findOneAndDelete", async function (next) {
  const docToDelete = await this.model.findOne(this.getQuery());
  if (docToDelete) {
    await ChallengeCategoryTypeFormat.deleteMany({ type: docToDelete._id });
  }
  next();
});

export default mongoose.model<ChallengeCategoryTypeDocument>(
  "Challenge_Category_Exercise",
  challengeCategoryTypeSchema
);
