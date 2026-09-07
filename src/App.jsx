import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import UserProfile from "./components/layout/UserProfile";
import ProductosPage from "./pages/ProductosPage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#020617]">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/carrito" element={<div className="text-white p-8">Carrito - Próximamente</div>} />
            <Route path="/checkout" element={<div className="text-white p-8">Checkout - Próximamente</div>} />
            <Route path="/perfil" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
