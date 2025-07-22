import { Request, Response } from "express";
import {
  createSport,
  updateSport,
  removeSport,
  getSportById,
  getAllSports,
  getAllSportsWithCategoriesAndSkills,
  sportsWithSkillLevel,
} from "../services/sports.js";

const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createSport(req);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await updateSport(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await removeSport(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getSportById(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};
const getSportsDrowpdown = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await getAllSportsWithCategoriesAndSkills(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};
const getSportsDrowpdownWithSkillLevel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await sportsWithSkillLevel(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getAllSports(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const sportsController = {
  create,
  update,
  remove,
  getById,
  getAll,
  getSportsDrowpdown,
  getSportsDrowpdownWithSkillLevel,
};
