import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  text: string;
  user: mongoose.Types.ObjectId;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community_Post",
      required: true,
    },
    text: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>(
  "Community_Post_Comment",
  commentSchema
);
