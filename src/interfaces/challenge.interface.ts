import { Types } from "mongoose";

export interface IChallenge {
  name: string;
  time: string;
  distance: string;
  mediaUrl: string;
  duration: string;
  createdBy: Types.ObjectId;
  community: Types.ObjectId;
  type: Types.ObjectId;
  exercise: Types.ObjectId;
  format: Types.ObjectId;
  participants: Types.ObjectId[];
  rules: string[];
  startDate: Date;
  endDate: Date;
  requiredVideo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
