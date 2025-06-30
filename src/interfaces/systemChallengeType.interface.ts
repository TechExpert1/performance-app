import { Types } from "mongoose";

export interface ISystemChallengeType {
  name: string;
  category: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
