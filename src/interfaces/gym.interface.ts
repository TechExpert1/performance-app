import { Types } from "mongoose";

export interface IGym {
  owner: Types.ObjectId;
  createdBy: Types.ObjectId;
  name: string;
  address: string;
  registration: string;
  cnic: string;
  adminStatus: string;
  sport: Types.ObjectId[];
  proofOfBusiness?: string[];
  gymImages?: string[];
  personalIdentification?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
