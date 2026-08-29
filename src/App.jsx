import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#020617]">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<div className="text-white p-8">Productos - Próximamente</div>} />
            <Route path="/carrito" element={<div className="text-white p-8">Carrito - Próximamente</div>} />
            <Route path="/checkout" element={<div className="text-white p-8">Checkout - Próximamente</div>} />
            <Route path="/perfil" element={<div className="text-white p-8">Perfil - Próximamente</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
