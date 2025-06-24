import { Types } from "mongoose";

export interface IChallengeCategoryType {
  name: string;
  challengeCategory: Types.ObjectId;
  rules: [{ type: String }];
  createdAt?: Date;
  updatedAt?: Date;
}
