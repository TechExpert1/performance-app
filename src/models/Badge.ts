import mongoose, { Schema, Document } from "mongoose";
import { IBadge } from "../interfaces/badge.interface";

export type BadgeDocument = IBadge & Document;

const badgeSchema = new Schema<BadgeDocument>(
    {
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ["daily_usage", "training_consistency", "goal_completion"],
            required: true,
        },
        description: { type: String, required: true },
        criteria: { type: Number, required: true },
        icon: { type: String },
        tier: {
            type: String,
            enum: ["bronze", "silver", "gold", "platinum"],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<BadgeDocument>("Badge", badgeSchema);
