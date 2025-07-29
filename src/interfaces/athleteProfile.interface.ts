import { Types } from "mongoose";

export interface IAthleteProfile {
  userId: Types.ObjectId;
  height: number;
  weight: number;
  sportsAndSkillLevels: {
    sport: Types.ObjectId;
    skillSetLevel: Types.ObjectId;
  }[];
}
