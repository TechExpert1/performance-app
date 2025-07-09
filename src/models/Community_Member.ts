import mongoose, { Schema, Document } from "mongoose";
import { ICommunityMember } from "../interfaces/communityMember.interface";

export type CommunityMemberDocument = ICommunityMember & Document;

const communityMemberSchema = new Schema<CommunityMemberDocument>(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "active", "removed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<CommunityMemberDocument>(
  "Community_Member",
  communityMemberSchema
);
