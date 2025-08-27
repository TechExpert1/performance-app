import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user.js";
import ChatBox from "../models/Chat_Box.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { sendMessageToUser } from "../webSocket/socket.js";
// import { sendPushNotification } from "../config/firebase.js";
import Notification from "../models/Notification.js";
// Send a message (text only)
export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { senderId, receiverId, text } = req.body;
  if (req.user?.id !== senderId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }
  try {
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
      files: req.fileUrls?.files || [],
      messageType: req.body.messageType,
    });
    sendMessageToUser(receiverId, message);
    let chatBox = await ChatBox.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (!chatBox) {
      chatBox = new ChatBox({
        sender: senderId,
        receiver: receiverId,
        latest_message: text,
      });
    } else {
      chatBox.latest_message = text;
    }

    await chatBox.save();

    // Get sender and receiver details
    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select("name deviceToken"),
      User.findById(receiverId).select("deviceToken"),
    ]);

    // Create notification
    const notification = await Notification.create({
      user: receiverId,
      message: `${sender?.name || "Someone"} sent you a message.`,
      entityType: "message",
      entityId: chatBox._id,
      isRead: false,
    });

    // Push notification
    // if (receiver?.deviceToken) {
    //   await sendPushNotification(
    //     receiver.deviceToken,
    //     "New Message",
    //     `${sender?.name || "Someone"} sent you a message.`,
    //     String(chatBox._id),
    //     "message"
    //   );
    // }
    res.status(201).json({
      message: "Message sent successfully",
      data: message,
      chatBoxId: chatBox._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getMessagesBetweenTwo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { senderId, receiverId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  if (req.user?.id !== senderId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    res.status(200).json({
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllChats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  if (req.user?.id !== userId) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  try {
    const chatList = await ChatBox.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatBox.countDocuments({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    res.status(200).json({
      chatList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
