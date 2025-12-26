import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user.js";
import {
    addCustomCategory,
    addCustomSkill,
    getCustomCategories,
    getCustomSkills,
    deleteCustomCategory,
    deleteCustomSkill,
} from "../services/customCategorySkill.js";

export const customCategorySkillController = {
    /**
     * POST /custom/categories
     * Body: { sportId: string, categoryName: string }
     */
    createCategory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const result = await addCustomCategory(req);
            res.status(201).json(result);
        } catch (err) {
            res
                .status(422)
                .json({ error: err instanceof Error ? err.message : "Unknown error" });
        }
    },

    /**
     * POST /custom/skills
     * Body: { categoryId: string, skillName: string }
     */
    createSkill: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const result = await addCustomSkill(req);
            res.status(201).json(result);
        } catch (err) {
            res
                .status(422)
                .json({ error: err instanceof Error ? err.message : "Unknown error" });
        }
    },

    /**
     * GET /custom/categories
     * Query: { sportId?: string }
     */
    getCategories: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const result = await getCustomCategories(req);
            res.status(200).json(result);
        } catch (err) {
            res
                .status(422)
                .json({ error: err instanceof Error ? err.message : "Unknown error" });
        }
    },

    /**
     * GET /custom/skills
     * Query: { categoryId?: string }
     */
    getSkills: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const result = await getCustomSkills(req);
            res.status(200).json(result);
        } catch (err) {
            res
                .status(422)
                .json({ error: err instanceof Error ? err.message : "Unknown error" });
        }
    },

    /**
     * DELETE /custom/categories/:id
     */
    deleteCategory: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const result = await deleteCustomCategory(req);
            res.status(200).json(result);
        } catch (err) {
            res
                .status(422)
                .json({ error: err instanceof Error ? err.message : "Unknown error" });
        }
    },

    /**
     * DELETE /custom/skills/:id
     */
    deleteSkill: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const result = await deleteCustomSkill(req);
            res.status(200).json(result);
        } catch (err) {
            res
                .status(422)
                .json({ error: err instanceof Error ? err.message : "Unknown error" });
        }
    },
};
