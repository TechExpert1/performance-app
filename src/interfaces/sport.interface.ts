import { Types } from "mongoose";

export interface ISport {
  name: string;
  image: string;
  sportsType: Types.ObjectId;
  skillSet: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
