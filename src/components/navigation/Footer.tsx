import React from "react";
import Logo from "../../assets/images/Icon1.png";
import { Link } from "react-router-dom";

const Footer: React.FC = () => (
  <footer className="relative w-full bg-primary-200 text-primary-700 py-6 lg:py-10 z-10 mt-8 border-t border-primary-300">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-4">
      <div className="flex items-center">
        <img src={Logo} alt="ParkPal Logo" className="h-8 w-8" />
        <span className="font-bold text-lg">ParkPal</span>
      </div>
      <nav className="flex gap-6 text-sm">
        <Link to="/about" className="hover:underline">
          About
        </Link>
        <Link to="/contact" className="hover:underline">
          Contact
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms
        </Link>
        <Link to="/privacy" className="hover:underline">
          Privacy
        </Link>
      </nav>
      <div className="text-xs text-gray-700">
        © {new Date().getFullYear()} ParkPal. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
