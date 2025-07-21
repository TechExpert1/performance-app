import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/user.js";
import ChatBox from "../models/Chat_Box.js";
import Message from "../models/Message.js";

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
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    await message.save();

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

    res.status(201).json({
      message: "Message sent successfully",
      chatBoxId: chatBox._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get messages between two users
export const getMessagesBetweenTwo = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { senderId, receiverId } = req.params;

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
    }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all chatboxes for a user
export const getAllChats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

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
      .sort({ updatedAt: -1 });

    res.status(200).json({ chatList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
