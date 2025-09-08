import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendOnline } from "@/utils/backendOnline";
const useLogout = () => {
    const navigate = useNavigate();
    const [isLogoutLoading, setIsLogoutLoading] = useState(false);

    const logout = async (BACKEND_BASE_URL) => {
        setIsLogoutLoading(true);
        try {
            await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            setIsLogoutLoading(false);
            navigate("/");
            return true;
        } catch (err) {
            // cannot be logged in if the backend isn't on, so mark as true
            if ((await backendOnline(BACKEND_BASE_URL)) === false) {
                return true;
            }
            console.error("Logout failed:", err);
            setIsLogoutLoading(false);
            return false;
        }
    };
    return { logout, isLogoutLoading };
};
export { useLogout };
