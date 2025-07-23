import mongoose, { Schema, Document } from "mongoose";

export interface IGymMember extends Document {
  user: mongoose.Types.ObjectId;
  gym: mongoose.Types.ObjectId;
  status: string;
}

const GymMemberSchema = new Schema<IGymMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gym: {
      type: Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IGymMember>("Gym_Member", GymMemberSchema);
