import { Types } from "mongoose";

export interface ISystemChallengeType {
  name: string;
  image: string;
  category: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
