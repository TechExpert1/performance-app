import { Types } from "mongoose";

export interface ISportCategory {
  name: string;
  sport: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
