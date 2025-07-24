import mongoose, { Schema, Document } from "mongoose";

export interface ITrainingMember extends Document {
  user: mongoose.Types.ObjectId;
  training: mongoose.Types.ObjectId;
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITrainingMember>(
  "Training_Member",
  TrainingMemberSchema
);
