// src/components/Footer.jsx
import {
    Facebook,
    Instagram,
    Mail,
    Phone,
    MapPin,
  } from "lucide-react";
  
  const Footer = () => {
    return (
      <footer className="bg-black text-gray-300 py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About / Branding */}
          <div>
            <h3 className="text-xl font-bold text-yellow-500 mb-3">
              Venice Restobar
            </h3>
            <p>
              A perfect place to unwind with great food and even better company. Visit us in Masinloc, Zambales.
            </p>
          </div>
  
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-yellow-500 mb-3">
              Contact Us
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone size={18} /> +63 912 345 6789
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} /> venicerestobar@email.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} /> Masinloc, Zambales
              </li>
            </ul>
          </div>
  
          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold text-yellow-500 mb-3">
              Follow Us
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:text-yellow-500 transition"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="hover:text-yellow-500 transition"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
            </div>
          </div>
        </div>
  
        {/* Bottom Line */}
        <div className="mt-10 text-center text-sm text-gray-500 border-t border-gray-700 pt-4">
          © {new Date().getFullYear()} Venice Restobar. All rights reserved.
        </div>
      </footer>
    );
  };
  
  export default Footer;
  