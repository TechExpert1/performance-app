import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  features: string[];
  price: number;
  durationInDays: number;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: { type: String, required: true, unique: true },
  features: { type: [String], required: true },
  price: { type: Number, required: true },
  durationInDays: { type: Number, required: true },
});

export default mongoose.model<ISubscriptionPlan>(
  "Subscription_Plan",
  SubscriptionPlanSchema
);
