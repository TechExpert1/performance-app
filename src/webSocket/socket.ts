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

  socket.on("sendMessage", (data: any) => {
    const { receiverId } = data;
    const receiverSocketId = onlineUsers[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", data);
      console.log(`Message sent to ${receiverId}:`, data);
    } else {
      console.log(`User ${receiverId} is offline`);
    }
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
