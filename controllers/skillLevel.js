import { createSkillLevel } from "../services/skillLevel.js";

export const create = async (req, res) => {
  try {
    const result = await createSkillLevel(req);
    res.status(201).json(result);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
};
