/////////////////////////////////////////////
// Dépendances
import { Routes, Route } from "react-router-dom";

/////////////////////////////////////////////
// Components
import ScrollToTop from "./utils/ScrollToTop";
import ProtectedRoute from "./utils/ProtectedRoute";
import Cookies from "js-cookie";

// import Navbar from "./components/Navbar/Navbar";

/////////////////////////////////////////////
// Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NavBar from "./components/NavBar";

// import Page404 from "./pages/Page404";
// import Notification from "./components/Notification";

//////////////////////////////////////////////////////////////////////////////////////////

export default function App() {

  const isLoggedIn = Boolean(Cookies.get("token"));

  return (
    <div className="min-h-screen">
      {isLoggedIn && <NavBar />}
      <div className="flex flex-col flex-grow">
        <ScrollToTop />
        <main className="flex-grow">
          <Routes>

            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />


            {/* <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } /> */}


            {/* <Route path="*" element={<Page404 />} /> */}

          </Routes>
        </main>
      </div>
    </div>
  );
}
