import { Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  sport?: Types.ObjectId;
  category?: Types.ObjectId;
  skill?: Types.ObjectId;
  sessionType: string;
  matchType?: string;
  matchResult?: string;
  tagFriend?: Types.ObjectId;
  opponent?: Types.ObjectId;
  clubOrTeam?: string;
  media?: [string];
  coachFeedback?: {
    coach: Types.ObjectId;
    rating: number;
  };
  peerFeedback?: {
    friend: Types.ObjectId;
    rating: number;
  };
  rating?: number;
  score?: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
