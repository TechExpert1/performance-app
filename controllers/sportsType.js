import {
  createSportsType,
  updateSportsType,
  removeSportsType,
  getSportsTypeById,
  getAllSportsTypes,
} from "../services/sportsType.js";

export const create = async (req, res) => {
  try {
    const result = await createSportsType(req);
    res.status(201).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const result = await updateSportsType(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await removeSportsType(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const result = await getSportsTypeById(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const result = await getAllSportsTypes(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};
