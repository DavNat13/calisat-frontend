import { Link } from "react-router-dom";
import LoginButton from "./LoginButton";

export default function Navbar() {
  return (
    <nav className="bg-[#020617] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-[#EA580C] font-bold text-xl">Calisat</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/productos" className="text-gray-300 hover:text-white text-sm transition-colors">
                Productos
              </Link>
              <Link to="/carrito" className="text-gray-300 hover:text-white text-sm transition-colors">
                Carrito
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
