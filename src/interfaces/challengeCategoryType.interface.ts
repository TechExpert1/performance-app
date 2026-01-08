import { Types } from "mongoose";

export interface IChallengeCategoryType {
  name: string;
  description: string;
  coachTip: string;
  entityType: string;
  distance?: string; // e.g., "20m", "100m", "5km" - for exercises with distance measurements
  time?: string; // e.g., "1 Minute", "10 Minutes", "20 Minutes" - for time-based exercises
  challengeCategory: Types.ObjectId;
  subCategory: Types.ObjectId;
  user: Types.ObjectId;
  rules: [{ type: String }];
  createdAt?: Date;
  updatedAt?: Date;
}
