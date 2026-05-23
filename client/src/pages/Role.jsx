import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "../socket"

export default function Role() {

  const navigate = useNavigate()

  const [role, setRole] = useState("")
  const [players, setPlayers] = useState([])
  const [voteCount, setVoteCount] = useState(0)
  const [voted, setVoted] = useState(false)

  useEffect(() => {

    socket.emit(
      "reconnect_player",
      {
        roomCode: localStorage.getItem("roomCode"),
        sessionId: localStorage.getItem("sessionId")
      },
      data => {

        setRole(data.role)
        setPlayers(data.room.players)
      }
    )

    socket.on("vote_update", count => {
      setVoteCount(count)
    })

    socket.on("game_result", result => {

      localStorage.setItem(
        "result",
        JSON.stringify(result)
      )

      navigate("/reveal")
    })

    return () => {
      socket.off("vote_update")
      socket.off("game_result")
    }

  }, [])

  function vote(target) {

    if (voted) return

    socket.emit("submit_vote", {
      roomCode: localStorage.getItem("roomCode"),
      target
    })

    setVoted(true)
  }

  return (
    <div>

      <h1>
        {
          role === "IMPOSTOR"
          ? "YOU ARE THE IMPOSTOR 💀"
          : role
        }
      </h1>

      <h2>Vote Someone</h2>

      {
        players.map(player => (
          <button
            key={player.username}
            onClick={() => vote(player.username)}
          >
            {player.username}
          </button>
        ))
      }

      <p>{voteCount} players voted</p>

    </div>
  )
}