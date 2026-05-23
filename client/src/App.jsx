import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Lobby from "./pages/Lobby"
import Role from "./pages/Role"
import Reveal from "./pages/Reveal"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route path="/role" element={<Role />} />
        <Route path="/reveal" element={<Reveal />} />
      </Routes>
    </BrowserRouter>
  )
}