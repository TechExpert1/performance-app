import { Types } from "mongoose";

export interface ITrainingCalendar {
  user: Types.ObjectId;
  attendees: Types.ObjectId[];
  trainingName: string;
  sport: Types.ObjectId;
  category: Types.ObjectId;
  skill: Types.ObjectId;
  trainingScope: string;
  date: Date;
  recurrence: string;
  recurrenceEndDate: Date;
  recurrenceStatus: string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
