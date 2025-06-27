import { Types } from "mongoose";

export interface IPhysicalPerformance {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  date: Date;
  title?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
