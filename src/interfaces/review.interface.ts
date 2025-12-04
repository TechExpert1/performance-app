import { Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;
  sport?: Types.ObjectId;
  category?: {
    categoryId: Types.ObjectId;
    categoryModel: "Sport_Category" | "User_Sport_Category";
  }[];
  skill?: {
    skillId: Types.ObjectId;
    skillModel: "Sport_Category_Skill" | "User_Sport_Category_Skill";
  }[];
  sessionType: string;
  matchType?: string;
  matchResult?: string;
  tagFriend?: Types.ObjectId;
  opponent?: string;
  clubOrTeam?: string;
  media?: [string];
  coachFeedback?: {
    coach: Types.ObjectId;
    rating: number;
    comment?: string;
  };
  peerFeedback?: {
    friend: Types.ObjectId;
    rating: number;
    comment?: string;
  };
  private?: boolean;
  rating?: number;
  score?: string;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
