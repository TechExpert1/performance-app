import { Types } from "mongoose";

export interface ICommunity {
  name: string;
  description?: string;
  image?: string;
  scope: "public" | "private";
  createdBy: Types.ObjectId;
  gym: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
