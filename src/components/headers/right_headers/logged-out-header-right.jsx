import { Link } from "react-router-dom";
export default function LoggedOutHeaderRight() {
    return (
        <nav className="hidden md:flex space-x-6">
            <Link to="/" className="nav-link">
                Home
            </Link>

            <Link to="/login" className="nav-link">
                Login
            </Link>
        </nav>
    );
}
