import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing/LandingPage";
import Home from "./pages/Home/Home";
import Scan from "./pages/Scan/Scan";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/scan" element={<Scan />} />
    </Routes>
  );
}

export default App;
