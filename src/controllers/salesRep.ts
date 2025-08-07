import { AuthenticatedRequest } from "./../middlewares/user";
import { Response } from "express";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import GymMember from "../models/Gym_Member.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";
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

  getAllGyms: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gyms = await Gym.find()
        .sort({ createdAt: -1 })
        .select("name address ");

      res.status(200).json({
        gyms,
      });
      return;
    } catch (error) {
      console.error("Error fetching gyms:", error);
      res.status(500).json({
        message: "Error fetching gyms",
        error,
      });
      return;
    }
  },

  getGymById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const gym = await Gym.findById(req.params.gymId).populate("owner");
      if (!gym) {
        res.status(404).json({
          message: "Gym not found",
        });
      }
      res.status(200).json({
        gym,
      });
      return;
    } catch (error) {
      console.error("Error fetching gyms:", error);
      res.status(500).json({
        message: "Error fetching gyms",
        error,
      });
      return;
    }
  },

  addGymMember: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { gymId, userId } = req.body;
      const loggedInUserId = req.user?.id;

      // Validate gym ownership
      let gym;
      if (req.user?.role === "gymOwner") {
        gym = await Gym.findOne({ _id: gymId, owner: loggedInUserId });
        if (!gym) {
          res
            .status(403)
            .json({ message: "Unauthorized to add members to this gym." });
          return;
        }
      } else {
        gym = await Gym.findById(gymId);
      }

      const user = await User.findById(userId).select("role deviceToken");
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }

      const existingMember = await GymMember.findOne({
        gym: gymId,
        user: userId,
      });
      if (existingMember) {
        res.status(400).json({
          message: `User is already a ${user.role} of this gym.!`,
        });
        return;
      }

      const newMember = await GymMember.create({
        user: userId,
        gym: gymId,
        role: user.role,
        status: "active",
      });

      // Construct Notification Message
      const actorName = req.user?.name || "Someone";
      const actorRole = req.user?.role;
      const gymName = gym?.name || "your gym";

      let message = "";

      if (actorRole === "salesRep") {
        message = `You have been added to ${gymName} by ${actorName}. Role: Sales Representative.`;
      } else if (actorRole === "gymOwner") {
        message = `You have been added to ${gymName} by ${actorName}. Role: Gym Owner.`;
      } else {
        message = `You have been added to ${gymName} by ${actorName}.`;
      }

      // Save Notification in DB
      await Notification.create({
        user: userId,
        message,
        entityType: "gym_member",
        entityId: newMember._id,
      });

      // Optional: Send Push Notification if deviceToken exists
      // if (user.deviceToken) {
      //   await sendPushNotification(
      //     user.deviceToken,
      //     "Gym Invitation",
      //     message,
      //     String(newMember._id),
      //     "gym_member"
      //   );
      // }

      res.status(201).json({
        message: `${user.role} added successfully`,
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
