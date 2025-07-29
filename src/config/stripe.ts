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

    // ✅ Validate interval
    const validIntervals = ["day", "week", "month", "year"];
    const planInterval = plan.interval;
    if (!validIntervals.includes(planInterval)) {
      res.status(400).json({ message: "Invalid plan interval" });
      return;
    }

    let stripePriceId = plan.stripePriceId;

    if (!stripePriceId) {
      const product = await stripe.products.create({
        name: plan.name || "Default Plan",
      });

      const price = await stripe.prices.create({
        unit_amount: (plan.price ?? 0) * 100,
        currency: "usd",
        product: product.id,
        recurring: {
          interval: planInterval as Stripe.Price.Recurring.Interval,
        },
      });

      stripePriceId = price.id;
      plan.stripePriceId = price.id;
      await plan.save();
    } else {
      const price = await stripe.prices.retrieve(stripePriceId);
      if (!price.recurring || price.recurring.interval !== planInterval) {
        const newPrice = await stripe.prices.create({
          unit_amount: (plan.price ?? 0) * 100,
          currency: "usd",
          product: price.product.toString(),
          recurring: {
            interval: planInterval as Stripe.Price.Recurring.Interval,
          },
        });

        stripePriceId = newPrice.id;
        plan.stripePriceId = newPrice.id;
        await plan.save();
      }
    }

    const now = new Date();

    await User_Subscription.updateMany(
      { user: req.user?.id, isActive: true },
      { $set: { isActive: false } }
    );

    const subscription = (await User_Subscription.create({
      user: req.user?.id,
      plan: planId,
      startDate: now,
      isActive: true,
      lastPaymentStatus: "pending",
    })) as unknown as { _id: Types.ObjectId };

    const customer = await stripe.customers.create({
      email: req.user?.email || "",
      name: req.user?.name || "",
      metadata: {
        userId: req.user?.id.toString() || "",
        subscriptionId: subscription._id.toString(),
        planId: planId.toString(),
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer: customer.id,
      success_url:
        process.env.STRIPE_SUCCESS_REDIRECT || "https://example.com/success",
      cancel_url:
        process.env.STRIPE_FAILURE_REDIRECT || "https://example.com/cancel",
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

    const relevantEvents = [
      "checkout.session.completed",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
    ];

    if (!relevantEvents.includes(event.type)) {
      res.status(200).send("Processed");
      return;
    }

    let customerId: string;
    let metadata: any;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      customerId = session.customer as string;

      const customer = await stripe.customers.retrieve(customerId);
      metadata = (customer as any).metadata;

      if (metadata?.subscriptionId && session.subscription) {
        await User_Subscription.findByIdAndUpdate(metadata.subscriptionId, {
          stripeSubscriptionId: session.subscription,
        });
      }
    }

    if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      customerId = invoice.customer as string;

      const customer = await stripe.customers.retrieve(customerId);
      metadata = (customer as any).metadata;

      if (metadata?.subscriptionId) {
        await User_Subscription.findByIdAndUpdate(metadata.subscriptionId, {
          lastPaymentStatus:
            event.type === "invoice.payment_succeeded" ? "succeeded" : "failed",
          lastPaymentDate: new Date(invoice.created * 1000),
          invoiceId: invoice.id,
        });
      }
    }

    res.status(200).send("Processed");
  } catch (err: any) {
    console.error("Stripe webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
