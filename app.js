import express from "express";
import http from "http";
import { Server as socketIo } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("joinRoom", (chatRoomId) => {
    console.log(`User ${socket.id} joined room ${chatRoomId}`);
    socket.join(chatRoomId);
  });

  socket.on("newChatRoom", (data) => {
    const { newRoomId, members } = data; 

    if (!newRoomId || !members) {
      console.error("Invalid data for newChatRoom event:", data);
      return;
    }

    members.forEach((memberId) => {
      io.to(memberId).emit("newChatRoom", {
        newRoomId,
        members,  
      });
    });

    console.log("New chat room created successfully:", { newRoomId, members });
  });



  socket.on("sendMessage", (data) => {
    const { id, message, senderId } = data;
    console.log(senderId);
    console.log(`Message for room ${id}: ${message}`);

    io.to(id).emit("receiveMessage", {
      message,
      id: id,
      sender: socket.id,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

// Start the server
server.listen(3001, () => {
  console.log("Server running on port 3001");
});
