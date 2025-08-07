import { Request, Response } from "express";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  updateProfileImage,
  handleGetProfile,
} from "../services/profile.js";
import { AuthenticatedRequest } from "../middlewares/user.js";
import User from "../models/User.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";
import FriendRequest from "../models/Friend_Request.js";

export const ProfileController = {
  get: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await getProfile(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getNotifications: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await handleGetProfile(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  update: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await updateProfile(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  delete: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await deleteProfile(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  updateImage: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await updateProfileImage(req);
      res.status(200).json(result);
    } catch (err) {
      res
        .status(422)
        .json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  sendFriendRequest: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      const { receiverId } = req.params;

      if (!user || !receiverId) {
        res.status(400).json({ message: "Sender or receiver is missing" });
        return;
      }

      const sender = await User.findById(user.id);
      const receiver = await User.findById(receiverId);

      if (!sender || !receiver) {
        res.status(404).json({ message: "Sender or receiver not found" });
        return;
      }

      const friendRequest = await FriendRequest.findOneAndUpdate(
        { sender: sender._id, receiver: receiver._id },
        { status: "pending", updatedAt: new Date() },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // Create in-app notification with sender name
      await Notification.create({
        user: receiver._id,
        message: `${sender.name} has sent you a friend request.`,
        entityType: "friend_request",
        entityId: friendRequest._id,
        isRead: false,
      });

      // Push notification
      // if (receiver.deviceToken) {
      //   await sendPushNotification(
      //     receiver.deviceToken,
      //     "New Friend Request",
      //     `${sender.name} has sent you a friend request.`,
      //     friendRequest._id.toString(),
      //     "friend_request"
      //   );
      // }

      res.status(201).json({
        message: "Friend request sent",
        data: friendRequest,
        sender: {
          id: sender._id,
          name: sender.name,
          email: sender.email,
        },
        receiver: {
          id: receiver._id,
          name: receiver.name,
          email: receiver.email,
        },
      });
      return;
    } catch (error) {
      res.status(500).json({
        message: "Failed to send friend request",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  },
  updateFriendRequestStatus: async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const status = req.query.status as "pending" | "accepted" | "rejected";

      if (!user || !status) {
        res.status(400).json({ message: "Invalid request" });
        return;
      }

      if (!["pending", "accepted", "rejected"].includes(status)) {
        res.status(400).json({ message: "Invalid status value" });
        return;
      }

      const friendRequest = await FriendRequest.findById(id);
      if (!friendRequest) {
        res.status(404).json({ message: "Friend request not found" });
        return;
      }

      if (friendRequest.receiver.toString() !== user.id) {
        res
          .status(403)
          .json({ message: "Not authorized to update this request" });
        return;
      }

      friendRequest.status = status;
      await friendRequest.save();

      const sender = await User.findById(friendRequest.sender);
      const receiver = await User.findById(friendRequest.receiver);

      if (!sender || !receiver) {
        res.status(404).json({ message: "Sender or receiver not found" });
        return;
      }

      if (status === "accepted") {
        await User.findByIdAndUpdate(sender._id, {
          $addToSet: { friends: receiver._id },
        });

        await User.findByIdAndUpdate(receiver._id, {
          $addToSet: { friends: sender._id },
        });
      }

      // Notify sender with receiver name
      await Notification.create({
        user: sender._id,
        message:
          status === "accepted"
            ? `${receiver.name} accepted your friend request.`
            : `${receiver.name} rejected your friend request.`,
        entityType: "friend_request",
        entityId: friendRequest._id,
        isRead: false,
      });

      // if (sender.deviceToken) {
      //   await sendPushNotification(
      //     sender.deviceToken,
      //     "Friend Request Update",
      //     status === "accepted"
      //       ? `${receiver.name} accepted your friend request.`
      //       : `${receiver.name} rejected your friend request.`,
      //     friendRequest._id.toString(),
      //     "friend_request"
      //   );
      // }

      res.status(200).json({
        message: `Friend request ${status}`,
        data: friendRequest,
        sender: {
          id: sender._id,
          name: sender.name,
          email: sender.email,
        },
        receiver: {
          id: receiver._id,
          name: receiver.name,
          email: receiver.email,
        },
      });
      return;
    } catch (error) {
      res.status(500).json({
        message: "Failed to update friend request",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return;
    }
  },
};
