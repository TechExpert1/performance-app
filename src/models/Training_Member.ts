import mongoose, { Schema, Document } from "mongoose";

export interface ITrainingMember extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  training: mongoose.Types.ObjectId;
  status: String; // "approved", "pending", "rejected"
  checkInStatus: String; // "invited", "checked-in"
  createdAt: Date;
  updatedAt: Date;
}

const TrainingMemberSchema = new Schema<ITrainingMember>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Training_Calendar",
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    checkInStatus: {
      type: String,
      enum: ["not-checked-in", "checked-in"],
      default: "not-checked-in",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITrainingMember>(
  "Training_Member",
  TrainingMemberSchema
);
