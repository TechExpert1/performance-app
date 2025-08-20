import mongoose, { Document, Schema, Model } from "mongoose";
import { IMessage } from "../interfaces/message.interface";

export interface IMessageDocument extends IMessage, Document {}

const messageSchema: Schema<IMessageDocument> = new Schema<IMessageDocument>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    files: { type: [String], default: [] },
    messageType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
  },
  { timestamps: true }
);

const Message: Model<IMessageDocument> = mongoose.model<IMessageDocument>(
  "Message",
  messageSchema
);

export default Message;
