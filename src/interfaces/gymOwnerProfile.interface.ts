import { Types } from "mongoose";

export interface IGymOwnerProfile {
  userId: Types.ObjectId;
  gymName: string;
  gymAddress: string;
  gymRegistration: string;
  cnic: string;
  sport: Types.ObjectId;
  proofOfBusiness?: string[];
  gymImages?: string[];
  personalIdentification?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
