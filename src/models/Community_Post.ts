import mongoose, { Schema, Document } from "mongoose";
import { ICommunityPost } from "../interfaces/communityPost.interface";

export type CommunityPostDocument = ICommunityPost & Document;

const communityPostSchema = new Schema<CommunityPostDocument>(
  {
    images: { type: [String] },
    caption: { type: String, trim: true },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<CommunityPostDocument>(
  "Community_Post",
  communityPostSchema
);
