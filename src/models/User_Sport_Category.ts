import mongoose, { Schema, Document, Types } from "mongoose";

// Interface
export interface IUserSportCategory {
  name: string;
  sport: Types.ObjectId;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Document type
export type UserSportCategoryDocument = IUserSportCategory & Document;

// Schema
const userSportCategorySchema = new Schema<UserSportCategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Model
export default mongoose.model<UserSportCategoryDocument>(
  "User_Sport_Category",
  userSportCategorySchema
);
