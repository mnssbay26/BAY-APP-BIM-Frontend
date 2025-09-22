import { useUserProfile } from "@/hooks/useUserProfile";
import { useLogout } from "@/hooks/useLogout";
const useUserSession = () => {
    const { userProfile, getUserProfile, clearUserProfile, isLoading, error } =
        useUserProfile();
    const { logout, isLogoutLoading } = useLogout();

    const handleLogout = async (BACKEND_BASE_URL) => {
        await logout(BACKEND_BASE_URL);
        clearUserProfile();
        window.location.href = "/";
    };

    return {
        userProfile,
        handleLogout,
        refreshProfile: getUserProfile,
        isLoading: isLogoutLoading || isLoading,
        error,
    };
};

export { useUserSession };
