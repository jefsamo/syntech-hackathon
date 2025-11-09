import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing/LandingPage";
import Home from "./pages/Home/Home";
import Scan from "./pages/Scan/Scan";
import Items from "./pages/Items/Items";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import { CookedPage } from "./pages/Cooked/Cooked";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/items" element={<Items />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/scan-food" element={<CookedPage />} />
    </Routes>
  );
}

export default App;
