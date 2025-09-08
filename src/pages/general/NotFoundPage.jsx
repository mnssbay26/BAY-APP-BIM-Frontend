import React from "react";
import { useNavigate } from "react-router-dom";

import BayerHeader from "../../components/headers/general.pages.header.jsx";

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <BayerHeader />
            <main className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-20 gap-10 mt-16">
                {/* Title Section */}
                <div className="w-full md:w-1/2 text-center">
                    <h1 className="text-5xl font-bold text-gray-900">
                        BAYER BIM APP
                    </h1>
                </div>

                {/* Instructions */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                    <p className="text-2xl text-gray-700 leading-relaxed">
                        Page Not Found: The page you are looking for does not
                        exist.
                        <br />
                        Please check the URL or go back to the home page.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors"
                        aria-label="Get started with Bayer BIM App"
                    >
                        Go Home Page
                    </button>
                </div>
            </main>
        </div>
    );
};

export default React.memo(NotFoundPage);
