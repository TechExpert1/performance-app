import { Types } from "mongoose";

export interface ISystemUserChallenge {
  user: Types.ObjectId;
  challenge: Types.ObjectId;
  type: Types.ObjectId;
  category: Types.ObjectId;
  status: "active" | "completed";
  submissions: {
    [key: string]: string | number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
