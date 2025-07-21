// models/GymOwnerProfile.ts
import mongoose, { Schema, Model, Document } from "mongoose";
import { IGym } from "../interfaces/gym.interface";

// Create a type that extends both Document and your interface
export type GymDocument = IGym & Document;

const GymSchema = new Schema<GymDocument>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    registration: { type: String, required: true },
    cnic: { type: String, required: true },
    sport: { type: Schema.Types.ObjectId, ref: "Sport", required: true },
    proofOfBusiness: [{ type: String }],
    gymImages: [{ type: String }],
    personalIdentification: [{ type: String }],
  },
  { timestamps: true }
);

// export const GymOwnerProfileModel = model<GymOwnerProfileDocument>(
//   "Gym_Owner_Profile",
//   GymOwnerProfileSchema
// );
const Gym: Model<GymDocument> = mongoose.model<GymDocument>("Gym", GymSchema);

export default Gym;
