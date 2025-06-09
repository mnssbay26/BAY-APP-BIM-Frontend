import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Site header component displaying login or user info after authentication.
 * Fetches user profile and uses shadcn/ui components for layout.
 * @returns {JSX.Element}
 */
export function BayerHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleClickOutsite = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsite);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsite);
    };
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 z-50 w-full h-16 flex items-center justify-between px-6 bg-white border-b shadow"
        role="banner"
      >
        {/* Branding */}
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            BAYER CROP SCIENCE BIM APP
          </Link>
        </div>

        {/* Navigation & User */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="nav-link">
            Home
          </Link>
          
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </nav>
      </header>
    </>
  );
}

export default React.memo(BayerHeader);
