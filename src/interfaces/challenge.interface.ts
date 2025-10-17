import { Types } from "mongoose";

export interface IDailySubmission {
  user: Types.ObjectId;
  date?: Date;
  time?: string;
  reps?: string;
  distance?: string;
  mediaUrl?: string;
  ownerApprovalStatus?: "pending" | "accepted" | "rejected";
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChallenge {
  name: string;
  time: string;
  sessionGoals: string;
  completionCount: string;
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
  dailySubmissions: IDailySubmission[];
  createdAt?: Date;
  updatedAt?: Date;
}
