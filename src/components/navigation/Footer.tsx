import React from "react";
import Logo from "../../assets/images/Icon1.png";

const Footer: React.FC = () => (
  <footer className="relative w-full bg-primary-300 text-primary-700 py-6 lg:py-10 z-10 mt-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-2">
        <img src={Logo} alt="ParkPal Logo" className="h-8 w-8" />
        <span className="font-bold text-lg">ParkPal</span>
      </div>
      <nav className="flex gap-6 text-sm">
        <a href="/about" className="hover:underline">
          About
        </a>
        <a href="/contact" className="hover:underline">
          Contact
        </a>
        <a href="/terms" className="hover:underline">
          Terms
        </a>
        <a href="/privacy" className="hover:underline">
          Privacy
        </a>
      </nav>
      <div className="text-xs text-gray-700">
        © {new Date().getFullYear()} ParkPal. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
