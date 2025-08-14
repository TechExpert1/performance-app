import { Types } from "mongoose";

export interface IDailySubmission {
  date: Date;
  mediaUrl: string;
  note?: string;
  ownerApprovalStatus: "pending" | "accepted" | "rejected";
}

export interface IUserChallenge {
  user: Types.ObjectId;
  challenge: Types.ObjectId;
  status: "active" | "completed" | "cancelled";
  dailySubmissions: IDailySubmission[];
  createdAt?: Date;
  updatedAt?: Date;
}
