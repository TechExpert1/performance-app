
import mongoose, { Model, Schema, Document } from "mongoose";
import { IOtpReset } from "../interfaces/resetOtp.interface";
export interface IOtpResetDocument extends IOtpReset, Document {}
const otpResetSchema: Schema<IOtpResetDocument> = new Schema<IOtpResetDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const OtpReset: Model<IOtpResetDocument> = mongoose.model<IOtpResetDocument>(
  "OtpReset",
  otpResetSchema
);
export default OtpReset;
