import { Types } from "mongoose";

export interface ICommunityPost {
  images?: string[];
  caption?: string;
  likes?: Number;
  community: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
