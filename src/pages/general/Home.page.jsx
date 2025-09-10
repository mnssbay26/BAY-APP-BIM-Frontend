import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import GeneralHeader from "@/components/headers/general-header.jsx";
/**
 * Home page component with app introduction and navigation to login.
 * @returns {JSX.Element}
 */
const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            {/* userProfile ? <PlatformHeader /> : <BayerHeader /> */}
            <GeneralHeader />

            <main className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-20 gap-10 mt-16">
                {/* Title Section */}
                <div className="w-full md:w-1/2 text-center">
                    <h1 className="text-5xl font-bold text-gray-900">
                        BAYER BIM APP
                    </h1>
                </div>

                {/* Description and Call-to-Action */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        The Bayer APP is a web application designed to provide a
                        seamless experience for users to interact with BIM360 &
                        Autodesk Construction Cloud. It allows users to access
                        reports, manage project insights, and utilize various
                        features related to Building Information Modeling (BIM)
                        and project management.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors"
                        aria-label="Get started with Bayer BIM App"
                    >
                        Get Started
                    </button>
                </div>
            </main>
        </div>
    );
};

export default React.memo(HomePage);
