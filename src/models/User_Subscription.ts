import mongoose, { Schema, Document } from "mongoose";

export interface IUserSubscription extends Document {
  user: mongoose.Types.ObjectId;
  status: String;
  stripeSubscriptionId: String;
  stripePriceId: String;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stripeSubscriptionId: { type: String },
    stripePriceId: { type: String },
    status: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model<IUserSubscription>(
  "User_Subscription",
  UserSubscriptionSchema
);
