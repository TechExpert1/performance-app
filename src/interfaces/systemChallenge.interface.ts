import { Types } from "mongoose";
export interface IChallengeLevel {
  badge: string;
  value: string;
}

export interface ISystemChallenge {
  title: string;
  description: string;
  coachTip: string;
  levels: IChallengeLevel[];
  format: Types.ObjectId;
  category: Types.ObjectId;
  categoryType: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
