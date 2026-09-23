import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Launches from "./pages/Launches.jsx";
import Coin from "./pages/Coin.jsx";
import Whitelist from "./pages/Whitelist.jsx";
import Board from "./pages/Board.jsx";
import Create from "./pages/Create.jsx";
import Docs from "./pages/Docs.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="launches" element={<Launches />} />
        <Route path="coin/:id" element={<Coin />} />
        <Route path="whitelist" element={<Whitelist />} />
        <Route path="board" element={<Board />} />
        <Route path="create" element={<Create />} />
        <Route path="docs" element={<Docs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
