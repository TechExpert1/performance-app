import { Types } from "mongoose";

export interface ISport {
  name: string;
  image: string;
  sportsType: Types.ObjectId;
  skillLevelSet: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
