import { Types } from "mongoose";

export interface ICustomCategory {
    name: string;
    sport: Types.ObjectId;
    createdBy: Types.ObjectId;
    gym?: Types.ObjectId; // If set, visible to all gym members; if null, only visible to createdBy
    createdAt?: Date;
    updatedAt?: Date;
}
