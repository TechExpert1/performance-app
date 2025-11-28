import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user.js";
import { getUserBadges } from "../services/badge.js";

export const badgeController = {
    getUserBadges: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const result = await getUserBadges(req);
            res.status(200).json(result);
        } catch (err) {
            res.status(422).json({
                error: err instanceof Error ? err.message : "Unknown error",
            });
        }
    },
};
