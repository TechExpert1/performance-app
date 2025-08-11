import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IReaction extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema: Schema<IReaction> = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

const Reaction: Model<IReaction> = mongoose.model<IReaction>(
  "Reaction",
  ReactionSchema
);
export default Reaction;
