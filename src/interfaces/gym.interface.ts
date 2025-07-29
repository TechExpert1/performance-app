import { Types } from "mongoose";

export interface IGym {
  owner: Types.ObjectId;
  name: string;
  address: string;
  registration: string;
  cnic: string;
  sport: Types.ObjectId[];
  proofOfBusiness?: string[];
  gymImages?: string[];
  personalIdentification?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
