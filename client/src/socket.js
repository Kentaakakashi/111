import { io } from "socket.io-client"

// 🔥 HARDCODED Railway URL (no env issues)
const URL = "https://111-production-ccbe.up.railway.app"

export const socket = io(URL, {
  transports: ["websocket"],
  secure: true
})

// 🔥 MOBILE DEBUG (you NEED this)
socket.on("connect", () => {
  alert("✅ Connected to server")
})

socket.on("connect_error", (err) => {
  alert("❌ Connection failed: " + err.message)
})
