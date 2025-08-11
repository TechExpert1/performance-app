import { Request } from "express";
import User from "../models/User.js";
import UserSubscription from "../models/User_Subscription.js";
import { stripe } from "../index.js";

// import Stripe from "stripe";

// export const handleCreateSubscription = async (req: Request) => {
//   try {
//     const { userId, priceId } = req.body;

//     if (!userId || !priceId) {
//       throw new Error("userId and priceId are required");
//     }

//     const user = await User.findById(userId);
//     if (!user) throw new Error("User not found");

//     if (!user.stripeCustomerId) {
//       const customer = await stripe.customers.create({
//         email: user.email,
//         name: user.name,
//         payment_method: req.body.paymentId,
//       });
//       user.stripeCustomerId = customer.id;
//       await user.save();
//     }

//     const subscription = await stripe.subscriptions.create({
//       customer: user.stripeCustomerId,
//       items: [{ price: priceId }],
//       trial_period_days: 30,
//       payment_behavior: "default_incomplete",
//     });

//     await UserSubscription.create({
//       user: userId,
//       stripeSubscriptionId: subscription.id,
//       stripePriceId: priceId,
//       status: subscription.status,
//     });

//     return {
//       subscriptionId: subscription.id,
//     };
//   } catch (error) {
//     console.error("Error in handleCreateSubscription:", error);
//     throw error;
//   }
// };
export const handleCreateSubscription = async (req: Request) => {
  try {
    const { userId, priceId, paymentMethodId } = req.body;

    if (!userId || !priceId || !paymentMethodId) {
      throw new Error("userId, priceId and paymentMethodId are required");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: 30,
      payment_behavior: "pending_if_incomplete",
      payment_settings: {
        payment_method_types: ["card"],
        payment_method_options: {
          card: {},
        },
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    await UserSubscription.create({
      user: userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
    });

    return {
      subscriptionId: subscription.id,
    };
  } catch (error) {
    console.error("Error in handleCreateSubscription:", error);
    throw error;
  }
};

export const handleUpdateSubscription = async (req: Request) => {
  try {
    const { subscriptionId, newPriceId } = req.body;

    if (!subscriptionId || !newPriceId) {
      throw new Error("subscriptionId and newPriceId are required");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(subscription);
    if (!subscription.items.data.length) {
      throw new Error("Subscription has no items to update");
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        proration_behavior: "create_prorations",
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
      }
    );

    await UserSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      { stripePriceId: newPriceId, status: updatedSubscription.status }
    );

    return updatedSubscription;
  } catch (error) {
    console.error("Error in handleUpdateSubscription:", error);
    throw error;
  }
};

export const handleCancelSubscription = async (req: Request) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      throw new Error("subscriptionId is required");
    }

    // Cancel subscription at period end (user keeps access till then)
    const canceled = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update DB status
    await UserSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      { status: "canceled" }
    );

    return canceled;
  } catch (error) {
    console.error("Error in handleCancelSubscription:", error);
    throw error;
  }
};

export const getAllProductsWithPrices = async (req: Request) => {
  const products = await stripe.products.list({ active: true });

  const productsWithPrices = await Promise.all(
    products.data.map(async (product) => {
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      });
      return {
        ...product,
        prices: prices.data,
      };
    })
  );

  return productsWithPrices;
};
