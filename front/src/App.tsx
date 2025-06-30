/////////////////////////////////////////////
// Dépendances
import { Routes, Route } from "react-router-dom";

/////////////////////////////////////////////
// Components
import ScrollToTop from "./utils/ScrollToTop";

// Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

//////////////////////////////////////////////////////////////////////////////////////////

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="flex flex-col flex-grow">
        <ScrollToTop />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
