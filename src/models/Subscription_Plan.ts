import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  features: string[];
  price: number;
  durationInDays: number;
  stripePriceId: string;
  interval: string;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: { type: String, required: true, unique: true },
  stripePriceId: { type: String },
  features: { type: [String], required: true },
  price: { type: Number, required: true },
  durationInDays: { type: Number },
  interval: {
    type: String,
    enum: ["day", "week", "month", "year"],
  },
});

export default mongoose.model<ISubscriptionPlan>(
  "Subscription_Plan",
  SubscriptionPlanSchema
);
