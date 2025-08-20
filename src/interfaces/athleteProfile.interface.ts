import { Types } from "mongoose";

export interface IAthleteProfile {
  userId: Types.ObjectId;
  height: {
    cm: number;
    inches: number;
  };
  weight: {
    kg: number;
    lbs: number;
  };

  sportsAndSkillLevels: {
    sport: Types.ObjectId;
    skillSetLevel: Types.ObjectId;
  }[];
}
