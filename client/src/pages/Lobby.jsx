import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { socket } from "../socket"

export default function Lobby() {

  const { roomCode } = useParams()

  const navigate = useNavigate()

  const [room, setRoom] = useState(null)

  useEffect(() => {

    function reconnect() {

      socket.emit(
        "reconnect_player",
        {
          roomCode,
          sessionId: localStorage.getItem("sessionId")
        },
        data => {

          if (!data.success) {
            return
          }

          setRoom(data.room)

          if (data.role) {
            navigate("/role")
          }
        }
      )
    }

    if (socket.connected) {
      reconnect()
    }

    socket.on("connect", reconnect)

    socket.on("room_update", room => {
      setRoom(room)
    })

    socket.on("game_started", () => {
      navigate("/role")
    })

    return () => {
      socket.off("connect", reconnect)
      socket.off("room_update")
      socket.off("game_started")
    }

  }, [])

  function startGame() {
    socket.emit("start_game", { roomCode })
  }

  if (!room) return <div>Loading...</div>

  return (
    <div>
      <h1>Lobby {roomCode}</h1>

      <button
        onClick={() =>
          navigator.clipboard.writeText(window.location.href)
        }
      >
        Copy Invite Link
      </button>

      <h2>Players</h2>

      {
        room.players.map(player => (
          <div key={player.username}>
            {player.username}
            {player.host ? " 👑" : ""}
            {!player.connected ? " reconnecting..." : ""}
          </div>
        ))
      }

      <br />

      <button onClick={startGame}>
        Start Game
      </button>
    </div>
  )
}
