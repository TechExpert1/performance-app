// models/GymOwnerProfile.ts
import mongoose, { Schema, Model, Document } from "mongoose";
import { IGymOwnerProfile } from "../interfaces/gymOwnerProfile.interface";

// Create a type that extends both Document and your interface
export type GymOwnerProfileDocument = IGymOwnerProfile & Document;

const GymOwnerProfileSchema = new Schema<GymOwnerProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gymName: { type: String, required: true },
    gymAddress: { type: String, required: true },
    gymRegistration: { type: String, required: true },
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
const Gym_Owner_Profile: Model<GymOwnerProfileDocument> =
  mongoose.model<GymOwnerProfileDocument>(
    "Gym_Owner_Profile",
    GymOwnerProfileSchema
  );

export default Gym_Owner_Profile;
