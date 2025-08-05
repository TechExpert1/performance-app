import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "../interfaces/user.interface";

export type UserDocument = IUser & Document;

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    deviceToken: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    adminStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    resetOTP: { type: String },
    token: { type: String },
    nationality: { type: String },
    dob: { type: Date },
    role: {
      type: String,
      enum: ["superAdmin", "gymOwner", "coach", "athlete", "salesRep"],
      required: true,
    },
    profileImage: { type: String },
    referralSource: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
    }, // for coach
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<UserDocument>("User", userSchema);
