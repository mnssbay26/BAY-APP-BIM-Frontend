import { useState } from "react";
import { backendOnline } from "@/utils/backendOnline";
const useLogout = () => {
    const [isLogoutLoading, setIsLogoutLoading] = useState(false);

    const logout = async (BACKEND_BASE_URL) => {
        if (!BACKEND_BASE_URL) {
            throw new Error("ERROR: ENV VARIABLE UNDEFINED");
        }
        setIsLogoutLoading(true);
        try {
            await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            setIsLogoutLoading(false);
            return true;
        } catch (err) {
            // cannot be logged in if the backend isn't on, so mark as true
            if ((await backendOnline(BACKEND_BASE_URL)) === false) {
                setIsLogoutLoading(false);
                return true;
            }
            setIsLogoutLoading(false);
            return false;
        }
    };
    return { logout, isLogoutLoading };
};
export { useLogout };
