import { io } from "socket.io-client";

export const socket = io("http://16.171.208.169", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});