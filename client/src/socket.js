import { io } from "socket.io-client"

// 🔥 Automatically pick correct backend URL
const URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

// 🔌 Create socket connection
export const socket = io(URL, {
  transports: ["websocket"], // ensures Railway works reliably
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000
})

// 🧠 Debug logs (VERY useful)
socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id)
})

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason)
})

socket.on("connect_error", (err) => {
  console.error("🚨 Connection Error:", err.message)
})
