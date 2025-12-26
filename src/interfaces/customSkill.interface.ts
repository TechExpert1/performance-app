import { Types } from "mongoose";

export interface ICustomSkill {
    name: string;
    category: Types.ObjectId; // References Sport_Category or Custom_Category
    createdBy: Types.ObjectId;
    gym?: Types.ObjectId; // If set, visible to all gym members; if null, only visible to createdBy
    createdAt?: Date;
    updatedAt?: Date;
}
