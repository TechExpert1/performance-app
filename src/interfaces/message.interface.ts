import { Types } from "mongoose";

export interface IMessage {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  text?: string; // Only required when messageType = "text"
  files?: string[]; // URLs of uploaded files
  messageType: "text" | "image" | "video";
}
