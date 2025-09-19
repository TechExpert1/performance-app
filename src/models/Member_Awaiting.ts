import mongoose, { Schema, Document } from "mongoose";

export interface IMemberAwaiting extends Document {
  email: string;
  createdBy: mongoose.Types.ObjectId;
  gym: mongoose.Types.ObjectId;
  code: string;
  address: string;
  contact: string;
  name: string;
}

const MemberAwaitingSchema = new Schema<IMemberAwaiting>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
    },

    gym: {
      type: Schema.Types.ObjectId,
    },

    name: {
      type: String,
    },
    address: {
      type: String,
    },
    contact: {
      type: String,
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
