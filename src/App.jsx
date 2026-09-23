import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Launches from "./pages/Launches.jsx";
import Coin from "./pages/Coin.jsx";
import Create from "./pages/Create.jsx";
import Docs from "./pages/Docs.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="launches" element={<Launches />} />
        <Route path="coin/:id" element={<Coin />} />
        <Route path="create" element={<Create />} />
        <Route path="docs" element={<Docs />} />
        <Route path="whitelist" element={<Navigate to="/create" replace />} />
        <Route path="board" element={<Navigate to="/launches" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
