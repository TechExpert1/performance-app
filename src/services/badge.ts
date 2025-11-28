import { AuthenticatedRequest } from "../middlewares/user.js";
import Badge from "../models/Badge.js";
import User_Badge from "../models/User_Badge.js";
import Training_Calendar from "../models/Training_Calendar.js";
import Attendance_Goal from "../models/Attendance_Goal.js";
import dayjs from "dayjs";

// Initialize all badges in the system
export const initializeBadges = async () => {
    try {
        const existingBadges = await Badge.countDocuments();
        if (existingBadges > 0) {
            console.log("Badges already initialized");
            return;
        }

        const badges = [
            // Daily Usage & Streaks
            {
                name: "Bronze",
                category: "daily_usage",
                description: "3-Day Streak - Logged training 3 days in a row",
                criteria: 3,
                tier: "bronze",
            },
            {
                name: "Silver",
                category: "daily_usage",
                description: "7-Day Streak - One week of daily activity",
                criteria: 7,
                tier: "silver",
            },
            {
                name: "Gold",
                category: "daily_usage",
                description: "30-Day Streak - One full month of daily logs",
                criteria: 30,
                tier: "gold",
            },
            {
                name: "Platinum",
                category: "daily_usage",
                description: "100-Day Streak - 100 consecutive training days",
                criteria: 100,
                tier: "platinum",
            },
            // Training Consistency (Weekly)
            {
                name: "Bronze",
                category: "training_consistency",
                description: "2 Weeks Consistent - Trained 4+ days/week for 2 weeks",
                criteria: 2,
                tier: "bronze",
            },
            {
                name: "Silver",
                category: "training_consistency",
                description: "4 Weeks Consistent",
                criteria: 4,
                tier: "silver",
            },
            {
                name: "Gold",
                category: "training_consistency",
                description: "12 Weeks Consistent",
                criteria: 12,
                tier: "gold",
            },
            {
                name: "Platinum",
                category: "training_consistency",
                description: "52 Weeks Consistent - A full year of weekly training",
                criteria: 52,
                tier: "platinum",
            },
            // Goal Completion
            {
                name: "Bronze",
                category: "goal_completion",
                description: "First Goal Crushed",
                criteria: 1,
                tier: "bronze",
            },
            {
                name: "Silver",
                category: "goal_completion",
                description: "5 Goals Completed",
                criteria: 5,
                tier: "silver",
            },
            {
                name: "Gold",
                category: "goal_completion",
                description: "10 Goals Completed",
                criteria: 10,
                tier: "gold",
            },
            {
                name: "Platinum",
                category: "goal_completion",
                description: "20 Goals Completed",
                criteria: 20,
                tier: "platinum",
            },
        ];

        await Badge.insertMany(badges);
        console.log("Badges initialized successfully");
    } catch (error) {
        console.error("Error initializing badges:", error);
    }
};

// Calculate daily streak for a user
const calculateDailyStreak = async (userId: string): Promise<number> => {
    try {
        const trainings = await Training_Calendar.find({ user: userId })
            .sort({ date: 1 })
            .select("date")
            .lean();

        if (trainings.length === 0) return 0;

        // Get unique training dates
        const uniqueDates = [
            ...new Set(
                trainings.map((t) => dayjs(t.date).format("YYYY-MM-DD"))
            ),
        ].sort();

        // Calculate current streak (working backwards from today)
        let currentStreak = 0;
        let maxStreak = 0;
        let today = dayjs().startOf("day");

        // Check if there's a training today or yesterday (to maintain streak)
        const lastTrainingDate = dayjs(uniqueDates[uniqueDates.length - 1]);
        const daysSinceLastTraining = today.diff(lastTrainingDate, "day");

        if (daysSinceLastTraining > 1) {
            // Streak is broken if last training was more than 1 day ago
            return 0;
        }

        // Calculate streak backwards from most recent date
        for (let i = uniqueDates.length - 1; i >= 0; i--) {
            const currentDate = dayjs(uniqueDates[i]);
            const expectedDate = dayjs(uniqueDates[uniqueDates.length - 1]).subtract(
                uniqueDates.length - 1 - i,
                "day"
            );

            if (currentDate.isSame(expectedDate, "day")) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                break;
            }
        }

        return currentStreak;
    } catch (error) {
        console.error("Error calculating daily streak:", error);
        return 0;
    }
};

// Calculate weekly consistency (number of consecutive weeks with 4+ training days)
const calculateWeeklyConsistency = async (userId: string): Promise<number> => {
    try {
        const trainings = await Training_Calendar.find({ user: userId })
            .sort({ date: 1 })
            .select("date")
            .lean();

        if (trainings.length === 0) return 0;

        // Group trainings by week
        const weeklyTrainings: Record<string, number> = {};

        trainings.forEach((training) => {
            const weekKey = dayjs(training.date).startOf("week").format("YYYY-MM-DD");
            weeklyTrainings[weekKey] = (weeklyTrainings[weekKey] || 0) + 1;
        });

        // Get weeks with 4+ training days
        const consistentWeeks = Object.entries(weeklyTrainings)
            .filter(([_, count]) => count >= 4)
            .map(([week, _]) => week)
            .sort();

        if (consistentWeeks.length === 0) return 0;

        // Calculate consecutive weeks from most recent
        let consecutiveWeeks = 0;
        const currentWeek = dayjs().startOf("week");
        const lastConsistentWeek = dayjs(consistentWeeks[consistentWeeks.length - 1]);

        // Check if the streak is still active (last consistent week is current or previous week)
        const weeksSinceLastConsistent = currentWeek.diff(lastConsistentWeek, "week");
        if (weeksSinceLastConsistent > 1) {
            return 0; // Streak is broken
        }

        // Count backwards for consecutive weeks
        for (let i = consistentWeeks.length - 1; i >= 0; i--) {
            const weekDate = dayjs(consistentWeeks[i]);
            const expectedWeek = dayjs(consistentWeeks[consistentWeeks.length - 1]).subtract(
                consistentWeeks.length - 1 - i,
                "week"
            );

            if (weekDate.isSame(expectedWeek, "week")) {
                consecutiveWeeks++;
            } else {
                break;
            }
        }

        return consecutiveWeeks;
    } catch (error) {
        console.error("Error calculating weekly consistency:", error);
        return 0;
    }
};

// Calculate goal completion count
const calculateGoalCompletion = async (userId: string): Promise<number> => {
    try {
        // Count completed goals where end date has passed and goal was achieved
        const completedGoals = await Attendance_Goal.countDocuments({
            user: userId,
            endDate: { $lte: new Date() },
        });

        return completedGoals;
    } catch (error) {
        console.error("Error calculating goal completion:", error);
        return 0;
    }
};

// Update user badges based on current progress
export const calculateUserBadges = async (userId: string) => {
    try {
        // Get all badges
        const allBadges = await Badge.find().lean();

        // Calculate current metrics
        const dailyStreak = await calculateDailyStreak(userId);
        const weeklyConsistency = await calculateWeeklyConsistency(userId);
        const goalCompletion = await calculateGoalCompletion(userId);

        // Process each badge
        for (const badge of allBadges) {
            let currentProgress = 0;
            let isUnlocked = false;

            // Determine progress based on badge category
            switch (badge.category) {
                case "daily_usage":
                    currentProgress = dailyStreak;
                    isUnlocked = dailyStreak >= badge.criteria;
                    break;
                case "training_consistency":
                    currentProgress = weeklyConsistency;
                    isUnlocked = weeklyConsistency >= badge.criteria;
                    break;
                case "goal_completion":
                    currentProgress = goalCompletion;
                    isUnlocked = goalCompletion >= badge.criteria;
                    break;
            }

            // Update or create user badge record
            const existingUserBadge = await User_Badge.findOne({
                user: userId,
                badge: badge._id,
            });

            if (existingUserBadge) {
                // Update existing record
                existingUserBadge.currentProgress = currentProgress;
                if (isUnlocked && !existingUserBadge.isUnlocked) {
                    existingUserBadge.isUnlocked = true;
                    existingUserBadge.unlockedAt = new Date();
                }
                await existingUserBadge.save();
            } else {
                // Create new record
                await User_Badge.create({
                    user: userId,
                    badge: badge._id,
                    currentProgress,
                    isUnlocked,
                    unlockedAt: isUnlocked ? new Date() : undefined,
                });
            }
        }

        console.log(`Badges calculated for user ${userId}`);
    } catch (error) {
        console.error(`Error calculating badges for user ${userId}:`, error);
    }
};

// Get user badges organized by category
export const getUserBadges = async (req: AuthenticatedRequest) => {
    try {
        if (!req.user) {
            return { message: "User not authenticated" };
        }

        const userId = req.user.id;

        // Initialize badges if not already done
        await initializeBadges();

        // Calculate latest badge progress for this user
        await calculateUserBadges(userId);

        // Get all badges with user progress
        const allBadges = await Badge.find().sort({ criteria: 1 }).lean();
        const userBadges = await User_Badge.find({ user: userId }).lean();

        // Create a map for quick lookup
        const userBadgeMap = new Map(
            userBadges.map((ub) => [ub.badge.toString(), ub])
        );

        // Calculate current metrics for display
        const dailyStreak = await calculateDailyStreak(userId);
        const weeklyConsistency = await calculateWeeklyConsistency(userId);
        const goalCompletion = await calculateGoalCompletion(userId);

        // Group badges by category
        const dailyUsageBadges = allBadges
            .filter((b) => b.category === "daily_usage")
            .map((badge) => {
                const userBadge = userBadgeMap.get(badge._id.toString());
                return {
                    ...badge,
                    isUnlocked: userBadge?.isUnlocked || false,
                    currentProgress: userBadge?.currentProgress || 0,
                    unlockedAt: userBadge?.unlockedAt,
                };
            });

        const trainingConsistencyBadges = allBadges
            .filter((b) => b.category === "training_consistency")
            .map((badge) => {
                const userBadge = userBadgeMap.get(badge._id.toString());
                return {
                    ...badge,
                    isUnlocked: userBadge?.isUnlocked || false,
                    currentProgress: userBadge?.currentProgress || 0,
                    unlockedAt: userBadge?.unlockedAt,
                };
            });

        const goalCompletionBadges = allBadges
            .filter((b) => b.category === "goal_completion")
            .map((badge) => {
                const userBadge = userBadgeMap.get(badge._id.toString());
                return {
                    ...badge,
                    isUnlocked: userBadge?.isUnlocked || false,
                    currentProgress: userBadge?.currentProgress || 0,
                    unlockedAt: userBadge?.unlockedAt,
                };
            });

        // Count unlocked badges per category
        const dailyUsageUnlocked = dailyUsageBadges.filter((b) => b.isUnlocked).length;
        const trainingConsistencyUnlocked = trainingConsistencyBadges.filter(
            (b) => b.isUnlocked
        ).length;
        const goalCompletionUnlocked = goalCompletionBadges.filter((b) => b.isUnlocked).length;

        return {
            message: "User badges fetched successfully",
            data: {
                lastUpdated: new Date().toISOString().split("T")[0],
                dailyUsageAndStreaks: {
                    currentStreak: dailyStreak,
                    maxBadges: 4,
                    unlockedBadges: dailyUsageUnlocked,
                    badges: dailyUsageBadges,
                },
                trainingConsistency: {
                    currentConsecutiveWeeks: weeklyConsistency,
                    maxBadges: 4,
                    unlockedBadges: trainingConsistencyUnlocked,
                    badges: trainingConsistencyBadges,
                },
                goalCompletion: {
                    totalGoalsCompleted: goalCompletion,
                    maxBadges: 4,
                    unlockedBadges: goalCompletionUnlocked,
                    badges: goalCompletionBadges,
                },
            },
        };
    } catch (error) {
        console.error("Error fetching user badges:", error);
        throw new Error("Failed to fetch user badges");
    }
};

// Calculate badges for all users (for cron job)
export const calculateAllUserBadges = async () => {
    try {
        console.log("Starting badge calculation for all users...");

        // Initialize badges if not already done
        await initializeBadges();

        // Get all unique user IDs from training calendar
        const userIds = await Training_Calendar.distinct("user");

        let successCount = 0;
        let errorCount = 0;

        for (const userId of userIds) {
            try {
                await calculateUserBadges(userId.toString());
                successCount++;
            } catch (error) {
                console.error(`Error calculating badges for user ${userId}:`, error);
                errorCount++;
            }
        }

        console.log(
            `Badge calculation completed. Success: ${successCount}, Errors: ${errorCount}`
        );

        return {
            message: "Badge calculation completed",
            success: successCount,
            errors: errorCount,
        };
    } catch (error) {
        console.error("Error in calculateAllUserBadges:", error);
        throw error;
    }
};
