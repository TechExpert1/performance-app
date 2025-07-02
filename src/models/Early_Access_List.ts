import mongoose, { Schema, Document } from "mongoose";
import { IEarlyAccessList } from "../interfaces/earlyAccessList.interface";

export type EarlyAccessListDocument = IEarlyAccessList & Document;

const earlyAccessListSchema = new Schema<EarlyAccessListDocument>(
  {
    name: { type: String },
    club: { type: String },
    country: { type: String },
    role: { type: String },
    referralSource: { type: String },
    email: { type: String },
    contactNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<EarlyAccessListDocument>(
  "Early_Access_List",
  earlyAccessListSchema
);
