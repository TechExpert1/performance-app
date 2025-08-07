import mongoose, { Document, Schema } from "mongoose";

// 1. Notification Interface
export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  message: string;
  entityType?: string;
  entityId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// 3. Notification Model
const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default Notification;
