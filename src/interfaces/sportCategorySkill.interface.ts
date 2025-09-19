import { Types } from "mongoose";

export interface ISportCategorySkill {
  name: string;
  description: string;
  coachTip: string;
  category: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
