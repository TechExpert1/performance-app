import { Request, Response } from "express";
import {
  createTrainingCalendar,
  updateTrainingCalendar,
  getAllTrainingCalendars,
  getTrainingCalendarById,
  deleteTrainingCalendar,
  getUserMonthlyTrainingCount,
} from "../services/trainingCalendar.js";
import TrainingMember from "../models/Training_Member.js";
import TrainingCalendar from "../models/Training_Calendar.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";

export const trainingCalendarController = {
  create: async (req: Request, res: Response) => {
    try {
      const result = await createTrainingCalendar(req);
      res.status(201).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const result = await updateTrainingCalendar(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const result = await getTrainingCalendarById(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(404)
        .json({ error: err instanceof Error ? err.message : "Not found" });
    }
  },

  getAll: async (req: Request, res: Response) => {
    try {
      const result = await getAllTrainingCalendars(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getMonthlyCount: async (req: Request, res: Response) => {
    try {
      const result = await getUserMonthlyTrainingCount(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const result = await deleteTrainingCalendar(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  checkInRequest: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const trainingId = req.params.id;

      if (!user) {
        res.status(401).json({ message: "Unauthorized user" });
        return;
      }

      const updatedCheckIn = await TrainingMember.findOneAndUpdate(
        {
          user: user.id,
          training: trainingId,
        },
        {
          $set: {
            status: "pending",
            checkInStatus: "checked-in",
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

      if (!updatedCheckIn) {
        res.status(500).json({ message: "Failed to update check-in status" });
        return;
      }

      res.status(201).json({
        message: "Check-in request submitted",
        data: updatedCheckIn,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to check-in",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  updateTrainingMemberStatus: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const trainingMember = await TrainingMember.findById(req.params.id);
      if (!trainingMember) {
        res.status(404).json({ message: "Training member not found" });
        return;
      }
      const training = await TrainingCalendar.findById(
        trainingMember.training
      ).populate("gym");

      if (!training) {
        res.status(404).json({ message: "Training  not found" });
        return;
      }
      const isCoach = training.coach?.toString() === user.id;
      const isSuperAdmin = user.role === "superAdmin";

      let isGymOwner = false;
      if (training.gym) {
        const gym = await Gym.findById(training.gym);
        isGymOwner = gym?.owner?.toString() === user.id;
      }

      if (!isCoach && !isSuperAdmin && !isGymOwner) {
        res
          .status(403)
          .json({ message: "Forbidden: You cannot update this status" });
        return;
      }

      const updated = await TrainingMember.findByIdAndUpdate(
        req.params.id,
        {
          status: req.query.status || "approved",
          checkInStatus: req.query.status === "rejected" ? "not-checked-in" : "checked-in",
        },
        { new: true }
      );
      if (req.query.status == "rejected") {
        await Notification.create({
          user: trainingMember.user,
          message: "Your check-in was rejected by the coach.",
          entityType: "training_calender",
          entityId: trainingMember._id,
          isRead: false,
        });
        const member = await User.findById(trainingMember.user).select(
          "deviceToken"
        );
        // if (member?.deviceToken) {
        //   return sendPushNotification(
        //     member.deviceToken,
        //     "Checkin rejected",
        //     "Your check-in request was rejected by the coach.",
        //     trainingMember._id.toString(),
        //     "training_calender"
        //   );
        // }
      }
      res.status(200).json({ message: "Status updated", data: updated });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update status",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
