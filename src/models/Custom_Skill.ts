import mongoose, { Schema, Document } from "mongoose";
import { ICustomSkill } from "../interfaces/customSkill.interface";

export type CustomSkillDocument = ICustomSkill & Document;

const customSkillSchema = new Schema<CustomSkillDocument>(
    {
        name: { type: String, required: true, trim: true },
        category: {
            type: mongoose.Schema.Types.ObjectId,
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
customSkillSchema.index({ createdBy: 1 });
customSkillSchema.index({ gym: 1 });
customSkillSchema.index({ category: 1 });

export default mongoose.model<CustomSkillDocument>(
    "Custom_Skill",
    customSkillSchema
);
