import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing/LandingPage";
import Home from "./pages/Home/Home";
import Scan from "./pages/Scan/Scan";
import Items from "./pages/Items/Items";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/items" element={<Items />} />
    </Routes>
  );
}

export default App;
