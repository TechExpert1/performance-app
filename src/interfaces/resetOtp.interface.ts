import { Types } from "mongoose";

export interface IOtpReset {
    userId: Types.ObjectId;
    otp: string | number;
}