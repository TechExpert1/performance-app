import { Types } from "mongoose";

export interface IChallenge {
  name: string;
  time: string;
  distance: string;
  mediaUrl: string;
  frequency: string;
  createdBy: Types.ObjectId;
  community: Types.ObjectId;
  type: Types.ObjectId;
  exercise: Types.ObjectId;
  format: Types.ObjectId;
  rules: string[];
  startDate: Date;
  endDate: Date;
  requiredVideo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
