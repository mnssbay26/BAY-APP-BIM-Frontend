import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useUserSession } from "@/hooks/useUserSession";
import { selectUserProfile } from "@/store/slices/user/userSlice";
import BayerLoadingOverlay from "@/components/general/general.pages.loading";

export default function PrivateRoutes() {
    const { isLoading, error } = useUserSession();
    const userProfile = useSelector(selectUserProfile);

    // if something goes wrong, go to login
    if (error) {
        return <Navigate to="/login" replace />;
    }

    // if loading, show it
    if (isLoading) {
        return <BayerLoadingOverlay />;
    }

    // on logged in, show Route, else navigate to Login
    return userProfile ? <Outlet /> : <Navigate to="/login" replace />;
}
