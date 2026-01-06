import mongoose, { Schema, Document } from "mongoose";
import { ISportCategory } from "../interfaces/sportCategory.interface";

export type SportCategoryDocument = ISportCategory & Document;

const sportCategorySchema = new Schema<SportCategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["gi", "no-gi"], default: null },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<SportCategoryDocument>(
  "Sport_Category",
  sportCategorySchema
);
