import Stripe from "stripe";
import { stripe } from "../index.js"; // This should export your initialized Stripe instance
import SubscriptionPlan from "../models/Subscription_Plan.js";
// 1. Create Products & Prices, store in DB

// export const createRequiredProductsAndPrices = async () => {
//   const products = [
//     // { name: "Base", monthly: 500, yearly: 5000 },
//     // { name: "Premium Gym Member", monthly: 800, yearly: 8000 },
//     { name: "Premium App User", monthly: 300 },
//     // { name: "Gym Starter", monthly: 4900, yearly: 49900 },
//     // { name: "Gym Pro", monthly: 9900, yearly: 99900 },
//     // { name: "Gym Premium", monthly: 19900, yearly: 199900 },
//   ];

//   for (const plan of products) {
//     // Create Stripe Product
//     const product = await stripe.products.create({ name: plan.name });

//     // Create Monthly Price
//     const monthlyPrice = await stripe.prices.create({
//       unit_amount: plan.monthly,
//       currency: "aud",
//       recurring: { interval: "month" },
//       product: product.id,
//     });

//     // Create Yearly Price
//     // const yearlyPrice = await stripe.prices.create({
//     //   unit_amount: plan.yearly,
//     //   currency: "aud",
//     //   recurring: { interval: "year" },
//     //   product: product.id,
//     // });

//     // Save to DB
//     await SubscriptionPlan.create({
//       name: plan.name,
//       stripeProductId: product.id,
//       stripeMonthlyPriceId: monthlyPrice?.id,
//       // stripeYearlyPriceId: yearlyPrice?.id,
//     });
//   }

//   console.log(
//     "✅ All products with monthly & yearly prices created and stored in DB"
//   );
// };
