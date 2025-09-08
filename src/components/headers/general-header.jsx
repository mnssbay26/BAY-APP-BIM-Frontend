// seeks to combine general.pages.header and platform.access.header
import { useUserSession } from "@/hooks/useUserSession";
import NoPlatformHeaderLeft from "./left_headers/no-platform-header-left";
import LoggedInHeaderRight from "./right_headers/logged-in-header-right";
import LoggedOutHeaderRight from "./right_headers/logged-out-header-right";

export default function GeneralHeader() {
    const { userProfile } = useUserSession();

    return (
        <header
            className="fixed top-0 left-0 z-50 w-full h-16 flex items-center justify-between px-6 bg-white border-b shadow"
            role="banner"
        >
            <NoPlatformHeaderLeft />
            {userProfile ? (
                <LoggedInHeaderRight userProfile={userProfile} />
            ) : (
                <LoggedOutHeaderRight />
            )}
        </header>
    );
}
