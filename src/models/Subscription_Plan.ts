import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  stripeProductId: string;
  stripeMonthlyPriceId: string;
  stripeYearlyPriceId: string;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: { type: String, required: true, unique: true },
  stripeProductId: { type: String },
  stripeMonthlyPriceId: { type: String },
  stripeYearlyPriceId: { type: String },
});

export default mongoose.model<ISubscriptionPlan>(
  "Subscription_Plan",
  SubscriptionPlanSchema
);
