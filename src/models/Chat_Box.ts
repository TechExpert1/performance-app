// models/ChatBox.ts

import mongoose, { Document, Schema, Model } from "mongoose";
import { IChatBox } from "../interfaces/chatBox.interface";

export interface IChatBoxDocument extends IChatBox, Document {}

const chatBoxSchema: Schema<IChatBoxDocument> = new Schema<IChatBoxDocument>(
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
    latest_message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ChatBox: Model<IChatBoxDocument> = mongoose.model<IChatBoxDocument>(
  "ChatBox",
  chatBoxSchema
);
export default ChatBox;
