import { Link } from "react-router-dom";
import UserNavbar from "./UserNavbar";

export default function Navbar() {
  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-primary font-bold text-xl">Calisat</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/productos" className="text-text-muted hover:text-white text-sm transition-colors">
                Productos
              </Link>
              <Link to="/carrito" className="text-text-muted hover:text-white text-sm transition-colors">
                Carrito
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserNavbar />
          </div>
        </div>
      </div>
    </nav>
  );
}
