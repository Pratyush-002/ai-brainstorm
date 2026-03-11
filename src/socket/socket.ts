import { io } from "socket.io-client";

export const socket = io("https://ai-brainstrom-backend.onrender.com", {
  autoConnect: true,
});