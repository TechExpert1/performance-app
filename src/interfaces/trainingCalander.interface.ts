import { Types } from "mongoose";

// Skill assignment for each week/month in recurring training (deprecated)
export interface IRecurrenceSkillSchedule {
  period: number; // Week number (1, 2, 3...) or Month number (1, 2, 3...)
  skills: Types.ObjectId[]; // Skills assigned for this period
}

// New: Training schedule per occurrence period
export interface ITrainingSchedule {
  period: number; // Occurrence number (1, 2, 3...)
  categories: Types.ObjectId[]; // Categories for this period
  skills: Types.ObjectId[]; // Skills assigned for this period
}

export interface ITrainingCalendar {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  coach?: Types.ObjectId;
  trainingName?: string;
  sport?: Types.ObjectId;
  category?: Types.ObjectId; // Deprecated, kept for backward compatibility
  categories?: Types.ObjectId[]; // Array of category IDs (for non-recurring or single training)
  gym?: Types.ObjectId;
  skill?: Types.ObjectId; // Deprecated, kept for backward compatibility
  skills?: Types.ObjectId[]; // Array of skill IDs (for non-recurring or single training)
  trainingScope?: string;
  date: Date;
  startTime?: string;
  finishTime?: string;
  recurrence?: string;
  recurrenceEndDate?: Date;
  recurrenceStatus?: string;
  numberOfOccurences?: number; // Number of occurrences for recurring trainings
  occurrencePeriod?: number; // Which occurrence this is (1, 2, 3...) in a recurring series
  numberOfWeeks?: number; // Deprecated: use numberOfOccurences instead
  numberOfMonths?: number; // Deprecated: use numberOfOccurences instead
  trainings?: ITrainingSchedule[]; // Training schedule per occurrence period
  weeklySkills?: IRecurrenceSkillSchedule[]; // Deprecated: use trainings instead
  monthlySkills?: IRecurrenceSkillSchedule[]; // Deprecated: use trainings instead
  classLimit?: Number; // Maximum number of attendees (optional, null = unlimited)
  note?: string;
  parentTrainingId?: Types.ObjectId; // Reference to original training for recurring instances
  isRecurringInstance?: boolean; // True for virtual recurring instances
  createdAt?: Date;
  updatedAt?: Date;
}

