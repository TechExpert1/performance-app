import { Types } from "mongoose";

export interface IChallengeCategory {
  name: string;
  image: string;
  challenge: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
