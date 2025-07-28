import { Request, Response } from "express";
import Stripe from "stripe";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { stripe } from "../index.js";
import User from "../models/User.js";
import Subscription_Plan from "../models/Subscription_Plan.js";
import { transporter } from "../utils/nodeMailer.js";
import User_Subscription from "../models/User_Subscription.js";

export const createRecurringSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { planId } = req.body;

    const plan = await Subscription_Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }

    // Ensure stripePriceId exists and is recurring
    let stripePriceId = plan.stripePriceId;

    if (!stripePriceId) {
      const product = await stripe.products.create({
        name: plan.name || "Default Plan",
      });

      const price = await stripe.prices.create({
        unit_amount: (plan.price ?? 0) * 100,
        currency: "usd",
        product: product.id,
        recurring: { interval: "month" }, // Ensure it's recurring
      });

      stripePriceId = price.id;
      plan.stripePriceId = price.id;
      await plan.save();
    } else {
      const price = await stripe.prices.retrieve(stripePriceId);
      if (!price.recurring) {
        // Create a new recurring price if existing is not valid
        const newPrice = await stripe.prices.create({
          unit_amount: (plan.price ?? 0) * 100,
          currency: "usd",
          product: price.product.toString(),
          recurring: { interval: "month" },
        });

        stripePriceId = newPrice.id;
        plan.stripePriceId = newPrice.id;
        await plan.save();
      }
    }
    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + plan.durationInDays);

    await User_Subscription.updateMany(
      { user: req.user?.id, isActive: true },
      { $set: { isActive: false } }
    );

    const subscription = (await User_Subscription.create({
      user: req.user?.id,
      plan: planId,
      startDate: now,
      endDate: end,
      isActive: true,
      paymentStatus: "pending",
    })) as { _id: Types.ObjectId };

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: req.user?.email,
      success_url:
        process.env.STRIPE_SUCCESS_REDIRECT || "https://example.com/success",
      cancel_url:
        process.env.STRIPE_FAILURE_REDIRECT || "https://example.com/cancel",
      metadata: {
        userId: req.user?.id || "",
        planId: planId.toString(),
        subscriptionId: subscription._id.toString(),
      },
    });
    res.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error("Stripe recurring session error:", error.message);
    res.status(500).json({ message: "Failed to create recurring session" });
  }
};

export const webhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const customer = await stripe.customers.retrieve(customerId);
      const metaData = (customer as any).metadata;
      console.log("sebuicriotion id ::::: ", metaData?.subscriptionId);
      console.log("metaData ::::: ", metaData);
      await User_Subscription.findByIdAndUpdate(metaData?.subscriptionId, {
        lastPaymentStatus:
          event.type === "invoice.payment_succeeded" ? "succeeded" : "failed",
        lastPaymentDate: new Date(invoice.created * 1000),
        invoiceId: invoice.id,
      });
    }

    res.status(200).send("Webhook event processed");
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
