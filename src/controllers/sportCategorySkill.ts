import { Request, Response } from "express";
import {
  createSportCategorySkill,
  updateSportCategorySkill,
  removeSportCategorySkill,
  getSportCategorySkillById,
  getAllSportCategorySkills,
} from "../services/sportCategorySkill.js";

export const sportCategorySkillController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createSportCategorySkill(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateSportCategorySkill(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await removeSportCategorySkill(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getSportCategorySkillById(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllSportCategorySkills(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
};
