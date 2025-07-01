/////////////////////////////////////////////
// Dépendances
import { Routes, Route } from "react-router-dom";

/////////////////////////////////////////////
// Components
import ScrollToTop from "./utils/ScrollToTop";
import ProtectedRoute from "./utils/ProtectedRoute";
import { AuthProvider, useAuth } from "./hooks/useAuth";

/////////////////////////////////////////////
// Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NavBar from "./components/NavBar";

// import Page404 from "./pages/Page404";
// import Notification from "./components/Notification";

//////////////////////////////////////////////////////////////////////////////////////////

function AppContent() {
  const { user, isLoading } = useAuth();

  // Afficher un spinner pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user && <NavBar />}
      <div className="flex flex-col flex-grow">
        <ScrollToTop />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            
            <Route path="/home" element={
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
