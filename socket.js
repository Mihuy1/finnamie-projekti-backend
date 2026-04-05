import { Server } from "socket.io";
import { postMessage } from "./src/controllers/conv-controller.js";

const postMessageHandler = (io, socket) => async (msg) => {
  try {
    const fakeReq = {
      body: {
        conv_id: msg.conv_id,
        receiver_id: msg.receiver_id,
        content: msg.content
      },
      user: { id: msg.sender_id }
    };

    const fakeRes = {
      status: () => fakeRes,
      json: (data) => data
    };

    const postedMessage = await postMessage(fakeReq, null, null);

    if (postedMessage) {
      io.to(msg.conv_id).emit("chat message", postedMessage);
    }
  } catch (err) {
    console.error("Socket postMessage error:", err);
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
    socket.on("chat message", postMessageHandler(io, socket));
    socket.on("join conversation", joinConversationHandler(socket));
    socket.on("leave conversation", leaveConversationHandler(socket));
  });
};
