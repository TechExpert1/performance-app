import { Request, Response } from "express";
import {
  createSportsType,
  updateSportsType,
  removeSportsType,
  getSportsTypeById,
  getAllSportsTypes,
} from "../services/sportsType.js";

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createSportsType(req);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await updateSportsType(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await removeSportsType(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getSportsTypeById(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getAllSportsTypes(req);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof Error) {
      res.status(422).json({ error: err.message });
    } else {
      res.status(422).json({ error: "Unknown error occurred" });
    }
  }
};
