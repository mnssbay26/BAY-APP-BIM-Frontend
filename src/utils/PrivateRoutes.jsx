import { Outlet, Navigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import BayerLoadingOverlay from "@/components/general/general.pages.loading";

export default function PrivateRoutes() {
    const { userProfile, isLoading, error } = useUserProfile();

    // if something goes wrong, go to login
    if (error) {
        return <Navigate to="/login" replace />;
    }

    // if loading, show it
    if (isLoading || userProfile === undefined) {
        return <BayerLoadingOverlay />;
    }

    // on logged in, show Route, else navigate to Login
    return userProfile ? <Outlet /> : <Navigate to="/login" replace />;
}
