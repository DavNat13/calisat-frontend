import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import UserProfile from "./components/layout/UserProfile";
import ProductosPage from "./pages/ProductosPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ROLES } from "./auth/roles";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route
              path="/carrito"
              element={
                <ProtectedRoute roles={[ROLES.CLIENTE]}>
                  <div className="text-white p-8">Carrito - Próximamente</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute roles={[ROLES.CLIENTE]}>
                  <div className="text-white p-8">Checkout - Próximamente</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute roles={[ROLES.CLIENTE]}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
