const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")
const { v4: uuidv4 } = require("uuid")

const rooms = require("./rooms")
const words = require("./words")

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase()
}

function getPublicRoom(room) {
  return {
    code: room.code,
    players: room.players.map(player => ({
      username: player.username,
      connected: player.connected,
      host: player.host
    }))
  }
}

io.on("connection", socket => {

  socket.on("create_room", ({ username }, callback) => {

    const roomCode = generateRoomCode()
    const sessionId = uuidv4()

    rooms[roomCode] = {
      code: roomCode,
      players: [],
      word: null,
      impostor: null
    }

    const player = {
      sessionId,
      socketId: socket.id,
      username,
      connected: true,
      host: true,
      role: null,
      vote: null
    }

    rooms[roomCode].players.push(player)

    socket.join(roomCode)

    callback({
      roomCode,
      sessionId,
      room: getPublicRoom(rooms[roomCode])
    })

    io.to(roomCode).emit("room_update", getPublicRoom(rooms[roomCode]))
  })

  socket.on("join_room", ({ roomCode, username }, callback) => {

    const room = rooms[roomCode]

    if (!room) {
      return callback({ error: "Room not found" })
    }

    const usernameTaken = room.players.some(
      p => p.username.toLowerCase() === username.toLowerCase()
    )

    if (usernameTaken) {
      return callback({ error: "Username already taken" })
    }

    const sessionId = uuidv4()

    room.players.push({
      sessionId,
      socketId: socket.id,
      username,
      connected: true,
      host: false,
      role: null,
      vote: null
    })

    socket.join(roomCode)

    callback({
      sessionId,
      room: getPublicRoom(room)
    })

    io.to(roomCode).emit("room_update", getPublicRoom(room))
  })

  socket.on("reconnect_player", ({ roomCode, sessionId }, callback) => {

    const room = rooms[roomCode]

    if (!room) return callback({ success: false })

    const player = room.players.find(
      p => p.sessionId === sessionId
    )

    if (!player) return callback({ success: false })

    player.socketId = socket.id
    player.connected = true

    socket.join(roomCode)

    callback({
      success: true,
      room: getPublicRoom(room),
      role: player.role
    })

    io.to(roomCode).emit("room_update", getPublicRoom(room))
  })

  socket.on("start_game", ({ roomCode }) => {

    const room = rooms[roomCode]
    if (!room) return

    const word = words[Math.floor(Math.random() * words.length)]

    room.word = word

    const impostorIndex = Math.floor(Math.random() * room.players.length)

    room.impostor = room.players[impostorIndex].username

    room.players.forEach((player, index) => {

      player.role = index === impostorIndex
        ? "IMPOSTOR"
        : word

      io.to(player.socketId).emit("role_assigned", player.role)
    })

    io.to(roomCode).emit("game_started")
  })

  socket.on("submit_vote", ({ roomCode, target }) => {

    const room = rooms[roomCode]
    if (!room) return

    const player = room.players.find(
      p => p.socketId === socket.id
    )

    if (!player) return

    player.vote = target

    const votedCount = room.players.filter(p => p.vote).length

    io.to(roomCode).emit("vote_update", votedCount)

    if (votedCount === room.players.length) {

      const votes = {}

      room.players.forEach(player => {
        votes[player.vote] = (votes[player.vote] || 0) + 1
      })

      io.to(roomCode).emit("game_result", {
        impostor: room.impostor,
        word: room.word,
        votes
      })
    }
  })

  socket.on("disconnect", () => {

    Object.values(rooms).forEach(room => {

      const player = room.players.find(
        p => p.socketId === socket.id
      )

      if (!player) return

      player.connected = false

      io.to(room.code).emit("room_update", getPublicRoom(room))

      setTimeout(() => {

        if (!player.connected) {

          room.players = room.players.filter(
            p => p.sessionId !== player.sessionId
          )

          io.to(room.code).emit("room_update", getPublicRoom(room))

          if (room.players.length === 0) {
            delete rooms[room.code]
          }
        }

      }, 15000)
    })
  })
})

app.get("/", (req, res) => {
  res.send("Trust Issues backend running")
})

const PORT = process.env.PORT || 3000

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`)
})
