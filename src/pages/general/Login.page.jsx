import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useUserProfile } from "@/hooks/useUserProfile.js";
import { Alert } from "@/components/ui/alert.jsx";

import BayerHeader from "../../components/general/general.pages.header.jsx";
import PlatformHeader from "@/components/platform_general_components/general_platform_components/platform.access.header.jsx";

const PopUp = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative">
                {
                    // inspired by https://tailwindflex.com/@lukas-muller/modal-popup
                }
                <svg
                    class="w-20 h-20 text-red-700 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v5m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

/**
 * Login page component for Autodesk authentication.
 * Handles redirect to Autodesk OAuth and logout flow.
 * @returns {JSX.Element}
 */
const LoginPage = () => {
    const [loginFailed, setLoginFailed] = useState(null);

    const [cookies] = useCookies(["access_token"]);
    const { userProfile } = useUserProfile();
    const navigate = useNavigate();
    const location = useLocation();

    const CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID;
    const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

    /**
     * Redirects user to Autodesk OAuth login page.
     */
    const login = async () => {
        if (!CLIENT_ID) {
            console.error("Missing VITE_API_CLIENT_ID environment variable");
            return;
        }

        const params = new URLSearchParams({
            response_type: "code",
            client_id: CLIENT_ID,
            redirect_uri: `${BACKEND_BASE_URL}/auth/three-legged`,
            scope: "data:read data:write data:create account:read",
        });

        window.location.href = `https://developer.api.autodesk.com/authentication/v2/authorize?${params.toString()}`;
    };

    /**
     * Logs out the user by calling backend and clearing cookies.
     */
    const logout = async () => {
        try {
            await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const handlePopUpClose = () => {
        setLoginFailed(false);
    };

    const handleFailedLoginParam = (location) => {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get("failed_login") === "true" && loginFailed === null) {
            setLoginFailed(true);
            urlParams.delete("failed_login");
            const newUrl = `${window.location.pathname}${
                urlParams.length > 0 ? "?" + urlParams.toString() : ""
            }`;
            window.history.replaceState({}, "", newUrl);
        }
    };

    useEffect(() => handleFailedLoginParam(location)), [location];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            {userProfile ? <PlatformHeader /> : <BayerHeader />}

            <main className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-20 gap-10 mt-16">
                {loginFailed ? (
                    <PopUp onClose={handlePopUpClose}>
                        Login failure. Please try again.
                    </PopUp>
                ) : (
                    <></>
                )}
                {/* Title Section */}
                <div className="w-full md:w-1/2 text-center space-y-4">
                    <h1 className="text-5xl font-bold text-gray-900">
                        BAYER BIM APP
                    </h1>
                    <h2 className="text-2xl text-gray-700">
                        {cookies.token ? "Welcome back" : "Login with Autodesk"}
                    </h2>
                </div>

                {/* Action Buttons */}
                <div className="w-full md:w-1/2 flex flex-col items-center space-y-6">
                    {cookies.token ? (
                        <>
                            <button
                                onClick={logout}
                                className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
                                aria-label="Logout from Autodesk"
                            >
                                Logout
                            </button>
                            <button
                                onClick={() => navigate("/platform")}
                                className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
                                aria-label="Go to platform selection"
                            >
                                Select Platform
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={login}
                            className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
                            aria-label="Login with Autodesk"
                        >
                            Login with Autodesk
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default React.memo(LoginPage);
