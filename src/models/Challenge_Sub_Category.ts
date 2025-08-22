import { Schema, model, Document, Types } from "mongoose";

export interface IChallengeSubCategory extends Document {
  name: string;
  challengeCategory: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChallengeSubCategorySchema = new Schema<IChallengeSubCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    challengeCategory: {
      type: Schema.Types.ObjectId,
      ref: "ChallengeCategory",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ChallengeSubCategory = model<IChallengeSubCategory>(
  "Challenge_Sub_Category",
  ChallengeSubCategorySchema
);
