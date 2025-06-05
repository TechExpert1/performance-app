import SkillLevelSet from "../models/Skill_Level.js";

export const createSkillLevel = async (req) => {
  try {
    const skillLevel = await Sport.create(req.body);

    return {
      message: "skillLevel created successfully",
      skillLevel,
    };
  } catch (error) {
    throw error;
  }
};
