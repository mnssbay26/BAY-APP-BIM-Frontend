import { Link } from "react-router-dom";
export default function NoPlatformHeaderLeft() {
    return (
        <div
            className="flex items-center space-x-4"
            data-testid="no-platform-header-left"
        >
            <Link
                to="/"
                className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
                BAYER CROP SCIENCE BIM APP
            </Link>
        </div>
    );
}
