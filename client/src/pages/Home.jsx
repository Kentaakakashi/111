import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "../socket"

export default function Home() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")

  function createRoom() {

    socket.emit("create_room", { username }, data => {

      localStorage.setItem("sessionId", data.sessionId)
      localStorage.setItem("roomCode", data.roomCode)

      navigate(`/lobby/${data.roomCode}`)
    })
  }

  function joinRoom() {

    socket.emit(
      "join_room",
      { roomCode, username },
      data => {

        if (data.error) {
          return alert(data.error)
        }

        localStorage.setItem("sessionId", data.sessionId)
        localStorage.setItem("roomCode", roomCode)

        navigate(`/lobby/${roomCode}`)
      }
    )
  }

  return (
    <div>
      <h1>TRUST ISSUES</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      <br />

      <button onClick={createRoom}>
        Create Lobby
      </button>

      <br /><br />

      <input
        placeholder="Room Code"
        value={roomCode}
        onChange={e => setRoomCode(e.target.value.toUpperCase())}
      />

      <br />

      <button onClick={joinRoom}>
        Join Lobby
      </button>
    </div>
  )
}