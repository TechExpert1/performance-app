import cron from "node-cron";
import { calculateAllUserBadges } from "../services/badge.js";

// Run daily at 2:00 AM to calculate badges for all users
cron.schedule("0 2 * * *", async () => {
    console.log("Running daily badge calculation cron job...");

    try {
        await calculateAllUserBadges();
        console.log("Daily badge calculation completed successfully");
    } catch (error) {
        console.error("Error in badge calculation cron job:", error);
    }
});

console.log("Badge calculation cron job scheduled: Daily at 2:00 AM");
