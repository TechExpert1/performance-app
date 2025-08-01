import { AuthenticatedRequest } from "./../middlewares/user";
import { Response } from "express";
import Gym from "../models/Gym.js";
import GymMember from "../models/Gym_Member.js";
export const salesRepController = {
  createGym: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gym = await Gym.create({
        createdBy: req.user?.id,
        ...req.body,
        proofOfBusiness: req.fileUrls?.proofOfBusiness || [],
        gymImages: req.fileUrls?.gymImages || [],
        personalIdentification: req.fileUrls?.personalIdentification || [],
      });

      res.status(201).json({
        message: "Gym created successfully",
        gym,
      });
      return;
    } catch (error) {
      console.error("Error creating gym:", error);
      res.status(500).json({
        message: error,
      });
      return;
    }
  },

  updateGym: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gymId = req.params.id;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const gym = await Gym.findById(gymId);
      if (!gym) {
        res.status(404).json({
          message: "Gym not found",
        });
        return;
      }

      if (gym.createdBy.toString() !== userId && userRole !== "superAdmin") {
        res.status(403).json({
          message: "You are not authorized to update this gym",
        });
        return;
      }

      const updatedData = {
        ...req.body,
      };

      if (req.fileUrls?.proofOfBusiness) {
        updatedData.proofOfBusiness = req.fileUrls.proofOfBusiness;
      }
      if (req.fileUrls?.gymImages) {
        updatedData.gymImages = req.fileUrls.gymImages;
      }
      if (req.fileUrls?.personalIdentification) {
        updatedData.personalIdentification =
          req.fileUrls.personalIdentification;
      }

      const updatedGym = await Gym.findByIdAndUpdate(gymId, updatedData, {
        new: true,
      });

      res.status(200).json({
        message: "Gym updated successfully",
        gym: updatedGym,
      });
      return;
    } catch (error) {
      console.error("Error updating gym:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error,
      });
      return;
    }
  },

  addGymMember: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { gymId, userId } = req.body;
      const loggedInUserId = req.user?.id;

      const gym = await Gym.findOne({ _id: gymId, createdBy: loggedInUserId });
      if (!gym) {
        res
          .status(403)
          .json({ message: "Unauthorized to add members to this gym." });
        return;
      }
      const existingMember = await GymMember.findOne({
        gym: gymId,
        user: userId,
      });
      if (existingMember) {
        res.status(400).json({
          message:
            "User is already a member of this gym. Status can be pending !",
        });
        return;
      }

      const newMember = await GymMember.create({
        user: userId,
        gym: gymId,
        status: "active",
      });

      res.status(201).json({
        message: "Gym member added successfully",
        member: newMember,
      });
      return;
    } catch (error) {
      console.error("Error adding gym member:", error);
      res.status(500).json({ message: "Internal Server Error", error });
      return;
    }
  },
};
