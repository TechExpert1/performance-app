import { Types } from "mongoose";
export interface IUser {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: "male" | "female" | "other";
  resetOTP?: string;
  token?: string;
  nationality?: string;
  dob?: Date;
  role: "superAdmin" | "gymOwner" | "coach" | "athlete";
  profileImage?: string;
  referralSource?: string;
  gym?: string;
  gymOwner?: Types.ObjectId; // for coach
  createdAt?: Date;
  updatedAt?: Date;
}
