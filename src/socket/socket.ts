import { io } from "socket.io-client";

export const socket = io("https://16.171.208.169:5000", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});