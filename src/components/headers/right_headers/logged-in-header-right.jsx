import { Link } from "react-router-dom";
import ProfileDropdown from "./profile_dropdown/profile-dropdown";

export default function LoggedInHeaderRight({ userProfile }) {
    return (
        <nav className="hidden md:flex space-x-6">
            <Link to="/" className="nav-link">
                Home
            </Link>
            <span>{userProfile}</span>
            <ProfileDropdown/>
        </nav>
    );
}
