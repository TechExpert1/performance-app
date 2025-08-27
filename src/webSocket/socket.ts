// socket.ts
import { io } from "../index.js";
import { Socket } from "socket.io";

const onlineUsers: { [userId: string]: string } = {};

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId: string) => {
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, sId] of Object.entries(onlineUsers)) {
      if (sId === socket.id) {
        delete onlineUsers[userId];
        console.log(`User ${userId} disconnected`);
      }
    }
  });
});

export const sendMessageToUser = (receiverId: string, message: any) => {
  const receiverSocketId = onlineUsers[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receiveMessage", message);
    console.log(`Message delivered to user ${receiverId}`);
  } else {
    console.log(`User ${receiverId} is offline`);
  }
};
