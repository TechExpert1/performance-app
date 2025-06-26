import { Request } from "express";
import Skill_Level_Set from "../models/Skill_Level.js";
import { ISkillLevelSet } from "../interfaces/skillLevelSet.interface";

interface CreateSkillLevelResult {
  message: string;
  skillLevel: ISkillLevelSet;
}

export const createSkillLevel = async (
  req: Request
): Promise<CreateSkillLevelResult> => {
  try {
    const skillLevel = await Skill_Level_Set.create(req.body);

    return {
      message: "Skill level created successfully",
      skillLevel,
    };
  } catch (error) {
    throw error;
  }
};
