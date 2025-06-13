import { Request } from "express";
import mongoose from "mongoose";
import SportCategorySkill, {
  SportCategorySkillDocument,
} from "../models/Sport_Category_Skill.js";

interface ServiceResponse<T> {
  message: string;
  skill?: T;
  data?: T[];
}

export const createSportCategorySkill = async (
  req: Request
): Promise<ServiceResponse<SportCategorySkillDocument>> => {
  const { categoryId } = req.params;

  const payload = {
    category: new mongoose.Types.ObjectId(categoryId),
    ...req.body,
  };

  const skill = await SportCategorySkill.create(payload);

  return {
    message: "Skill created successfully",
    skill,
  };
};

export const updateSportCategorySkill = async (
  req: Request
): Promise<ServiceResponse<SportCategorySkillDocument>> => {
  const updated = await SportCategorySkill.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  if (!updated) return { message: "Skill not found" };

  return {
    message: "Skill updated successfully",
    skill: updated,
  };
};

export const removeSportCategorySkill = async (
  req: Request
): Promise<ServiceResponse<null>> => {
  const removed = await SportCategorySkill.findByIdAndDelete(req.params.id);
  if (!removed) return { message: "Skill not found" };

  return { message: "Skill removed successfully" };
};

export const getSportCategorySkillById = async (
  req: Request
): Promise<SportCategorySkillDocument | { message: string }> => {
  const found = await SportCategorySkill.findById(req.params.id).populate(
    "category"
  );
  if (!found) return { message: "Skill not found" };
  return found;
};

export const getAllSportCategorySkills = async (
  req: Request
): Promise<ServiceResponse<SportCategorySkillDocument>> => {
  const { categoryId } = req.params;

  const skills = await SportCategorySkill.find({
    category: categoryId,
  }).populate("category");

  return {
    message: "Skills fetched successfully",
    data: skills,
  };
};
