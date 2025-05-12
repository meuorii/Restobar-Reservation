import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCloseMenu = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black bg-opacity-90 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          Venice Restobar
        </Link>

        {/* Desktop Nav */}
        <div className="space-x-6 hidden md:flex">
          <Link to="/" className="hover:text-yellow-500">
            Home
          </Link>
          <Link to="/menu" className="hover:text-yellow-500">
            Menu
          </Link>
          <Link to="/reservation" className="hover:text-yellow-500">
            Reservation
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-black bg-opacity-90 px-4 pb-4 space-y-2 text-center">
          <Link to="/" onClick={handleCloseMenu} className="block hover:text-yellow-500">
            Home
          </Link>
          <Link to="/menu" onClick={handleCloseMenu} className="block hover:text-yellow-500">
            Menu
          </Link>
          <Link to="/reservation" onClick={handleCloseMenu} className="block hover:text-yellow-500">
            Reservation
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
