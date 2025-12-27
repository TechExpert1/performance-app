import mongoose from "mongoose";
import CustomCategory, {
    CustomCategoryDocument,
} from "../models/Custom_Category.js";
import CustomSkill, { CustomSkillDocument } from "../models/Custom_Skill.js";
import Gym from "../models/Gym.js";
import Gym_Member from "../models/Gym_Member.js";
import { AuthenticatedRequest } from "../middlewares/user.js";

interface ServiceResponse<T> {
    message: string;
    category?: T;
    skill?: T;
    data?: T[];
}

/**
 * Add a custom category
 * - Athletes: category visible only to themselves
 * - Gym owners: category visible to all gym members
 */
export const addCustomCategory = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<CustomCategoryDocument>> => {
    const { sportId, categoryName } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!sportId || !categoryName) {
        throw new Error("sportId and categoryName are required");
    }

    let gymId: mongoose.Types.ObjectId | null = null;

    // If gym owner, get their gym ID
    if (userRole === "gymOwner") {
        const gym = await Gym.findOne({ owner: userId }).lean();
        if (!gym) {
            throw new Error("Gym not found for this owner");
        }
        gymId = gym._id as mongoose.Types.ObjectId;
    }

    const category = await CustomCategory.create({
        name: categoryName,
        sport: new mongoose.Types.ObjectId(sportId),
        createdBy: new mongoose.Types.ObjectId(userId),
        gym: gymId,
    });

    return {
        message: "Custom category created successfully",
        category,
    };
};

/**
 * Add a custom skill
 * - Athletes: skill visible only to themselves
 * - Gym owners: skill visible to all gym members
 */
export const addCustomSkill = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<CustomSkillDocument>> => {
    const { categoryId, skillName } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (!categoryId || !skillName) {
        throw new Error("categoryId and skillName are required");
    }

    let gymId: mongoose.Types.ObjectId | null = null;

    // If gym owner, get their gym ID
    if (userRole === "gymOwner") {
        const gym = await Gym.findOne({ owner: userId }).lean();
        if (!gym) {
            throw new Error("Gym not found for this owner");
        }
        gymId = gym._id as mongoose.Types.ObjectId;
    }

    const skill = await CustomSkill.create({
        name: skillName,
        category: new mongoose.Types.ObjectId(categoryId),
        createdBy: new mongoose.Types.ObjectId(userId),
        gym: gymId,
    });

    return {
        message: "Custom skill created successfully",
        skill,
    };
};

/**
 * Get custom categories visible to the user
 * - Athletes: their own categories + categories from their gym (if member)
 * - Gym owners: categories they created for their gym
 */
export const getCustomCategories = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<CustomCategoryDocument>> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { sportId } = req.query;

    const query: any = {};

    if (sportId) {
        query.sport = new mongoose.Types.ObjectId(sportId as string);
    }

    if (userRole === "gymOwner") {
        // Gym owner sees categories they created
        query.createdBy = new mongoose.Types.ObjectId(userId);
    } else if (userRole === "athlete") {
        // Athlete sees:
        // 1. Categories they created themselves (gym is null)
        // 2. Categories from their gym (if they are a gym member)
        const gymMember = await Gym_Member.findOne({
            user: userId,
            status: "active",
        }).lean();

        if (gymMember) {
            query.$or = [
                { createdBy: new mongoose.Types.ObjectId(userId), gym: null },
                { gym: gymMember.gym },
            ];
        } else {
            query.createdBy = new mongoose.Types.ObjectId(userId);
            query.gym = null;
        }
    }

    const categories = await CustomCategory.find(query)
        .populate("sport", "name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .lean();

    return {
        message: "Custom categories fetched successfully",
        data: categories as CustomCategoryDocument[],
    };
};

/**
 * Get custom skills visible to the user
 * - Athletes: their own skills + skills from their gym (if member)
 * - Gym owners: skills they created for their gym
 */
export const getCustomSkills = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<CustomSkillDocument>> => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { categoryId } = req.query;

    const query: any = {};

    if (categoryId) {
        query.category = new mongoose.Types.ObjectId(categoryId as string);
    }

    if (userRole === "gymOwner") {
        // Gym owner sees skills they created
        query.createdBy = new mongoose.Types.ObjectId(userId);
    } else if (userRole === "athlete") {
        // Athlete sees:
        // 1. Skills they created themselves (gym is null)
        // 2. Skills from their gym (if they are a gym member)
        const gymMember = await Gym_Member.findOne({
            user: userId,
            status: "active",
        }).lean();

        if (gymMember) {
            query.$or = [
                { createdBy: new mongoose.Types.ObjectId(userId), gym: null },
                { gym: gymMember.gym },
            ];
        } else {
            query.createdBy = new mongoose.Types.ObjectId(userId);
            query.gym = null;
        }
    }

    const skills = await CustomSkill.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .lean();

    return {
        message: "Custom skills fetched successfully",
        data: skills as CustomSkillDocument[],
    };
};

/**
 * Update a custom category (only by creator)
 */
export const updateCustomCategory = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<CustomCategoryDocument>> => {
    const { id } = req.params;
    const { categoryName } = req.body;
    const userId = req.user!.id;

    if (!categoryName) {
        throw new Error("categoryName is required");
    }

    const category = await CustomCategory.findOne({
        _id: id,
        createdBy: userId,
    });

    if (!category) {
        throw new Error("Category not found or you don't have permission to update it");
    }

    category.name = categoryName;
    await category.save();

    return {
        message: "Custom category updated successfully",
        category,
    };
};

/**
 * Update a custom skill (only by creator)
 */
export const updateCustomSkill = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<CustomSkillDocument>> => {
    const { id } = req.params;
    const { skillName } = req.body;
    const userId = req.user!.id;

    if (!skillName) {
        throw new Error("skillName is required");
    }

    const skill = await CustomSkill.findOne({
        _id: id,
        createdBy: userId,
    });

    if (!skill) {
        throw new Error("Skill not found or you don't have permission to update it");
    }

    skill.name = skillName;
    await skill.save();

    return {
        message: "Custom skill updated successfully",
        skill,
    };
};

/**
 * Delete a custom category (only by creator)
 */
export const deleteCustomCategory = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<null>> => {
    const { id } = req.params;
    const userId = req.user!.id;

    const category = await CustomCategory.findOne({
        _id: id,
        createdBy: userId,
    });

    if (!category) {
        throw new Error("Category not found or you don't have permission to delete it");
    }

    // Also delete all custom skills associated with this category
    await CustomSkill.deleteMany({
        category: id,
    });

    await CustomCategory.findByIdAndDelete(id);

    return {
        message: "Custom category and associated skills deleted successfully",
    };
};

/**
 * Delete a custom skill (only by creator)
 */
export const deleteCustomSkill = async (
    req: AuthenticatedRequest
): Promise<ServiceResponse<null>> => {
    const { id } = req.params;
    const userId = req.user!.id;

    const skill = await CustomSkill.findOne({
        _id: id,
        createdBy: userId,
    });

    if (!skill) {
        throw new Error("Skill not found or you don't have permission to delete it");
    }

    await CustomSkill.findByIdAndDelete(id);

    return {
        message: "Custom skill deleted successfully",
    };
};
