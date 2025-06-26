import { Types } from "mongoose";

export interface IAthleteProfile {
  userId: Types.ObjectId;
  height: number;
  weight: number;
  sports: string;
  skillLevel: string;
  createdAt?: Date;
  updatedAt?: Date;
}
