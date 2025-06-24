import { Types } from "mongoose";

export interface IChallengeCategory {
  name: string;
  challenge: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
