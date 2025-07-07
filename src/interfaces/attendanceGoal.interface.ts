import { Types } from "mongoose";

export interface IAttendanceGoal {
  user: Types.ObjectId;
  type: string;
  name: string;
  noOfSessions: number;
  month: string;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
