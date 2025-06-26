import { Types } from "mongoose";

export interface ISportCategorySkill {
  name: string;
  category: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
