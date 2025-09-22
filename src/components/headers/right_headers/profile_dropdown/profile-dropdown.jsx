import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserSession } from "@/hooks/useUserSession";
import { useHideOnOutsideClick } from "@/hooks/useHideOnOutsideClick";

export default function ProfileDropdown() {
    const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;
    if (!BACKEND_BASE_URL) {
        throw new Error("Found the problem.");
    }
    const navigate = useNavigate();

    const { handleLogout } = useUserSession();
    const { ref, isVisible, toggle } = useHideOnOutsideClick();

    const handleGoPlatform = () => {
        navigate("/platform");
    };

    return (
        <>
            <div ref={ref}>
                <button className="focus:outline-none" onClick={toggle}>
                    <FaUser className="h-5 w-5" />
                </button>
            </div>

            {isVisible && (
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
                                onClick={() => handleLogout(BACKEND_BASE_URL)}
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
}
