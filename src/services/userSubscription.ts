import SubscriptionPlan from "../models/Subscription_Plan.js";
import UserSubscription from "../models/User_Subscription.js";
import { Request } from "express";
import { AuthenticatedRequest } from "../middlewares/user.js";

// ✅ Subscribe a user to a plan
export const subscribeUser = async (req: AuthenticatedRequest) => {
  try {
    const { planId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return { message: "Subscription plan not found" };

    const now = new Date();
    const end = new Date(now);
    end.setDate(now.getDate() + plan.durationInDays);

    // Deactivate all previous active subscriptions
    await UserSubscription.updateMany(
      { user: req.user?.id, isActive: true },
      { $set: { isActive: false } }
    );

    const newSub = await UserSubscription.create({
      user: req.user?.id,
      plan: planId,
      startDate: now,
      endDate: end,
      isActive: true,
    });

    return newSub;
  } catch (error) {
    console.error("Error in subscribeUser:", error);
    throw error;
  }
};

// ✅ Get subscriptions with filters and sorting
export const getFilters = async (req: Request) => {
  try {
    const { sortBy = "createdAt", sortOrder = "desc", ...filters } = req.query;
    const query: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query[key] = value;
      }
    });

    const sort: Record<string, 1 | -1> = {
      [sortBy as string]: sortOrder === "asc" ? 1 : -1,
    };

    const data = await UserSubscription.find(query)
      .populate("user")
      .populate("plan")
      .sort(sort);

    return { data };
  } catch (error) {
    console.error("Error in getFilters:", error);
    throw error;
  }
};

// ✅ Cancel active subscription for a user
export const cancelUserSubscription = async (req: Request) => {
  try {
    const { userId } = req.params;

    const updated = await UserSubscription.findOneAndUpdate(
      { user: userId, isActive: true },
      { $set: { isActive: false, endDate: new Date() } },
      { new: true }
    );

    if (!updated) return { message: "No active subscription found" };

    return { message: "Subscription cancelled", data: updated };
  } catch (error) {
    console.error("Error in cancelUserSubscription:", error);
    throw error;
  }
};
