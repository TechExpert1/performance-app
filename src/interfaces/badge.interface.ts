import mongoose from "mongoose";

export interface IBadge {
    name: string;
    category: "daily_usage" | "training_consistency" | "goal_completion";
    description: string;
    criteria: number;
    icon?: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
}

export interface IUserBadge {
    user: mongoose.Types.ObjectId;
    badge: mongoose.Types.ObjectId;
    isUnlocked: boolean;
    currentProgress: number;
    unlockedAt?: Date;
}

