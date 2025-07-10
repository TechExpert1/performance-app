import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

export type UserDocument = IUser & Document;

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    resetOTP: { type: String },
    token: { type: String },
    nationality: { type: String },
    dob: { type: Date },
    role: {
      type: String,
      enum: ["superAdmin", "gymOwner", "coach", "athlete"],
      required: true,
    },
    profileImage: { type: String },
    referralSource: { type: String },
    gymOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // for coach
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>("User", userSchema);
