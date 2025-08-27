import { Server, Socket } from "socket.io";

let ioInstance: Server; // will hold io
const onlineUsers: { [userId: string]: string } = {};

// Called once in index.ts to register handlers and store io
export function registerSocketHandlers(io: Server) {
  ioInstance = io; // ✅ store io globally here

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
}

export function sendMessageToUser(receiverId: string, message: any) {
  const receiverSocketId = onlineUsers[receiverId];
  if (receiverSocketId && ioInstance) {
    ioInstance.to(receiverSocketId).emit("receiveMessage", message);
    console.log(`Message delivered to user ${receiverId}`);
  } else {
    console.log(`User ${receiverId} is offline`);
  }
}
