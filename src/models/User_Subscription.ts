import mongoose, { Schema, Document } from "mongoose";

export interface IUserSubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  startDate: Date;
  paymentStatus: String;
  paymentMethod: String;
  lastPaymentStatus: String;
  lastPaymentDate: String;
  invoiceId: String;
  endDate: Date;
  isActive: boolean;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Subscription_Plan",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "rejected"],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    paymentMethod: { type: String },
    lastPaymentStatus: { type: String },
    lastPaymentDate: { type: String },
    invoiceId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUserSubscription>(
  "User_Subscription",
  UserSubscriptionSchema
);
