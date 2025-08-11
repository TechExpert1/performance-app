import mongoose, { Schema, Document } from "mongoose";
import { ICommunityPost } from "../interfaces/communityPost.interface";

export type CommunityPostDocument = ICommunityPost & Document;

const communityPostSchema = new Schema<CommunityPostDocument>(
  {
    images: { type: [String] },
    caption: { type: String, trim: true },
    likes: { type: Number, default: 0 },
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reaction" }],
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
communityPostSchema.virtual("comments", {
  ref: "Community_Post_Comment", // model name of the comment schema
  localField: "_id", // the field on Community_Post
  foreignField: "post", // the field in comment that refers to Community_Post
});

communityPostSchema.set("toObject", { virtuals: true });
communityPostSchema.set("toJSON", { virtuals: true });
export default mongoose.model<CommunityPostDocument>(
  "Community_Post",
  communityPostSchema
);
