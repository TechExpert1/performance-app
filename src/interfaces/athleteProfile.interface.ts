import { Types } from "mongoose";

export interface IAthleteProfile {
  userId: Types.ObjectId;
  height: number;
  weight: number;
  sports: Types.ObjectId;
  skillLevel: string;
  createdAt?: Date;
  updatedAt?: Date;
}
