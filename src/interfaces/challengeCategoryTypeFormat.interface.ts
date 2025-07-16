import { Types } from "mongoose";

export interface IChallengeCategoryTypeFormat {
  name: string;
  category: Types.ObjectId;
  type: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
