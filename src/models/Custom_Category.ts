import mongoose, { Schema, Document } from "mongoose";
import { ICustomCategory } from "../interfaces/customCategory.interface";

export type CustomCategoryDocument = ICustomCategory & Document;

const customCategorySchema = new Schema<CustomCategoryDocument>(
    {
        name: { type: String, required: true, trim: true },
        sport: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Sport",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        gym: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gym",
            default: null,
        },
    },
    { timestamps: true }
);

// Index for efficient querying by visibility
customCategorySchema.index({ createdBy: 1 });
customCategorySchema.index({ gym: 1 });
customCategorySchema.index({ sport: 1 });

export default mongoose.model<CustomCategoryDocument>(
    "Custom_Category",
    customCategorySchema
);
