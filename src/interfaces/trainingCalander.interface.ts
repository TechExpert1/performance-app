import { Types } from "mongoose";

// Skill assignment for each week/month in recurring training
export interface IRecurrenceSkillSchedule {
  period: number; // Week number (1, 2, 3...) or Month number (1, 2, 3...)
  skills: Types.ObjectId[]; // Skills assigned for this period
}

export interface ITrainingCalendar {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  coach?: Types.ObjectId;
  trainingName?: string;
  sport?: Types.ObjectId;
  category?: Types.ObjectId; // Deprecated, kept for backward compatibility
  categories?: Types.ObjectId[]; // New: array of category IDs
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
  numberOfWeeks?: number; // Number of weeks for weekly recurrence
  numberOfMonths?: number; // Number of months for monthly recurrence
  weeklySkills?: IRecurrenceSkillSchedule[]; // Skills per week for weekly recurrence
  monthlySkills?: IRecurrenceSkillSchedule[]; // Skills per month for monthly recurrence
  classLimit?: Number; // Maximum number of attendees (optional, null = unlimited)
  note?: string;
  parentTrainingId?: Types.ObjectId; // Reference to original training for recurring instances
  isRecurringInstance?: boolean; // True for virtual recurring instances
  createdAt?: Date;
  updatedAt?: Date;
}

