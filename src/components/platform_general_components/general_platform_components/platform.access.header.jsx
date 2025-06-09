import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

const PlatformHeader = ({ accountId, projectId }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [projectsData, setProjectsData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/general/user/profile`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.error("Error fetching user profile:");
          setError("Error fetching user profile");
          return;
        }

        const data = await response.json();
        setUserProfile(data.data.user.emailId);
      } catch (error) {
        setError(
          error?.response?.data?.message || "Error fetching user profile"
        );
      }
    };
    getUserProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  const handleGoPlatform = () => {
    navigate("/platform");
  };

  const handleGoAuth = () => {
    navigate("/Login");
  };

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
        <div className="flex items-center gap-6" ref={containerRef}>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </nav>

          <div className="relative flex items-center gap-2 text-sm">
            {userProfile ? (
              <>
                <span>{userProfile}</span>
                <button
                  className="focus:outline-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <FaUser className="h-5 w-5" />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-10 right-0 mt-2 bg-[#f6f6f6] border border-gray-600 rounded-md shadow-lg w-48 z-50 text-black">
                    <ul className="flex flex-col">
                      <li>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-[#2ea3e3] hover:text-white"
                          onClick={handleGoPlatform}
                        >
                          Select Platform
                        </button>
                      </li>
                      <li>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-[#2ea3e3] hover:text-white"
                          onClick={handleGoAuth}
                        >
                          Signin Page
                        </button>
                      </li>
                      <li>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-[#2ea3e3] hover:text-white"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleGoAuth}
                className="hover:text-gray-300 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default PlatformHeader;
