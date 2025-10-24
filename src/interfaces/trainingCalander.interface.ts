import { Types } from "mongoose";

export interface ITrainingCalendar {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  coach?: Types.ObjectId;
  trainingName?: string;
  sport?: Types.ObjectId;
  category?: Types.ObjectId;
  gym?: Types.ObjectId;
  skill?: Types.ObjectId; // Deprecated, kept for backward compatibility
  skills?: Types.ObjectId[]; // New: array of skill IDs
  trainingScope?: string;
  date: Date;
  startTime?: string;
  finishTime?: string;
  recurrence?: string;
  recurrenceEndDate?: Date;
  recurrenceStatus?: string;
  classLimit?: Number; // Maximum number of attendees (optional, null = unlimited)
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
