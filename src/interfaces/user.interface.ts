import { Types } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: "male" | "female" | "other";
  resetOTP?: string;
  token?: string;
  adminStatus: string;
  nationality?: string;
  dob?: Date;
  role: "superAdmin" | "gymOwner" | "coach" | "athlete";
  profileImage?: string;
  referralSource?: string;
  friends?: [Types.ObjectId];
  gym?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
