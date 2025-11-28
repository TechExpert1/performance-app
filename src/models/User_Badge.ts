import mongoose, { Schema, Document } from "mongoose";
import { IUserBadge } from "../interfaces/badge.interface";

export type UserBadgeDocument = IUserBadge & Document;

const userBadgeSchema = new Schema<UserBadgeDocument>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        badge: { type: mongoose.Schema.Types.ObjectId, ref: "Badge", required: true },
        isUnlocked: { type: Boolean, default: false },
        currentProgress: { type: Number, default: 0 },
        unlockedAt: { type: Date },
    },
    { timestamps: true }
);

// Create compound index to ensure one record per user per badge
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export default mongoose.model<UserBadgeDocument>("User_Badge", userBadgeSchema);
