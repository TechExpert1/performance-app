import mongoose, { Schema, Document } from "mongoose";
import { ICommunity } from "../interfaces/community.interface";

export type CommunityDocument = ICommunity & Document;

const communitySchema = new Schema<CommunityDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    scope: { type: String, enum: ["public", "private"], default: "public" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<CommunityDocument>("Community", communitySchema);
