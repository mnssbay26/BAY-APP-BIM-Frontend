import { Outlet, Navigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import BayerLoadingOverlay from "@/components/general/general.pages.loading";
import sleep from "./sleep";

export default function PrivateRoutes() {
    const { userProfile, isLoading } = useUserProfile();
    if (isLoading || userProfile === undefined) {
        return <BayerLoadingOverlay />;
    }
    /// return (userProfile ? <div>{userProfile}</div> : <div>{userProfile}</div>)
    return userProfile ? <Outlet /> : <Navigate to="/login" replace />;
}
