import mongoose, { Document, Schema, Model } from "mongoose";
import { IMessage } from "../interfaces/message.interface";

export interface IMessageDocument extends IMessage, Document {}

const messageSchema: Schema<IMessageDocument> = new Schema<IMessageDocument>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ["audio", "video", "image", "document"],
    },
  },
  {
    timestamps: true,
  }
);

const Message: Model<IMessageDocument> = mongoose.model<IMessageDocument>(
  "Message",
  messageSchema
);
export default Message;
