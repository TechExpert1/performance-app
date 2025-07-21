import { Types } from "mongoose";
export interface IMessage {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  text?: string;
  fileUrl?: string;
  fileType?: "audio" | "video" | "image" | "document";
}
