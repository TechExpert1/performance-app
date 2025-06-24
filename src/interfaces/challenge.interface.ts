import { Types } from "mongoose";

export interface IChallenge {
  name: string;
  gym: string;
  frequency: string;
  category: Types.ObjectId;
  type: Types.ObjectId;
  rules: string[];
  startDate: Date;
  endDate: Date;
  media: {
    type: "photo" | "video";
    url: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
