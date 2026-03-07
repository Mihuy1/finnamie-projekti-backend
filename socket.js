import { Server } from "socket.io";
import { postMessage } from "./src/controllers/conv-controller.js";

const postMessageHandler = (io) => async (msg) => {
  try {
    const postedMessage = await postMessage(msg);
    io.to(msg.conv_id).emit("chat message", postedMessage);
  } catch (err) {
    console.error(err);
  }
};

const joinConversationHandler = (socket) => (conv_id) => {
  socket.join(conv_id);
};

const leaveConversationHandler = (socket) => (conv_id) => {
  socket.leave(conv_id);
};

export const createSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("chat message", postMessageHandler(io));
    socket.on("join conversation", joinConversationHandler(socket));
    socket.on("leave conversation", leaveConversationHandler(socket));
  });
};
