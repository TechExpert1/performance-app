import {
  createSport,
  updateSport,
  removeSport,
  getSportById,
  getAllSports,
} from "../services/sports.js";

const create = async (req, res) => {
  try {
    const result = await createSport(req);
    res.status(201).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const result = await updateSport(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await removeSport(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await getSportById(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const result = await getAllSports(req);
    res.status(200).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};

export const sportsController = {
  create,
  update,
  remove,
  getById,
  getAll,
};
