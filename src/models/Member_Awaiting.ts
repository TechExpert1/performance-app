import mongoose, { Schema, Document } from "mongoose";

export interface IMemberAwaiting extends Document {
  email: string;
  code: string;
}

const MemberAwaitingSchema = new Schema<IMemberAwaiting>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMemberAwaiting>(
  "Member_Awaiting",
  MemberAwaitingSchema
);
