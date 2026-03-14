import { io } from "socket.io-client";

export const socket = io("https://ai-brainstrom-backend.onrender.com", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});