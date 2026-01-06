import { Types } from "mongoose";

export interface ISportCategory {
  name: string;
  type?: "gi" | "no-gi";
  sport: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
