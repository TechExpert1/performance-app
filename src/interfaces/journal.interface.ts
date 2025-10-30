import { Types } from "mongoose";

export interface IFeedback {
  text: string;
  rating: number; // 0-10
  createdAt?: Date;
}

export interface IJournal {
  _id: Types.ObjectId;
  user: Types.ObjectId; // The athlete/user who owns this journal entry
  date: Date;
  sport?: Types.ObjectId;
  sessionType?: string; // e.g., "2 Handed Pickup", "Training", "Match"
  category?: Types.ObjectId; // Sport category
  categories?: Types.ObjectId[]; // Multiple categories
  skill?: Types.ObjectId; // Skill type
  skills?: Types.ObjectId[]; // Multiple skills
  startTime?: string;
  finishTime?: string;
  trainingCalendar?: Types.ObjectId; // Link to training session if applicable
  
  // Feedback sections
  personalFeedback?: IFeedback;
  peerFeedback?: IFeedback;
  coachFeedback?: IFeedback;
  
  // Media
  videoUrl?: string;
  videoThumbnail?: string;
  
  // Metadata
  reviewScore?: number; // Average of all ratings
  isPublic?: boolean; // Whether peers can see this
  createdAt?: Date;
  updatedAt?: Date;
}
