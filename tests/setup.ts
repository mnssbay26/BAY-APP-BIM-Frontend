// tests/setup.js
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Load constants
const BACKEND_URL = process.env.VITE_API_BACKEND_BASE_URL;

// Utility function
const sleep = async (seconds: number) => {
    const mstime = seconds * 1000;
    return new Promise((resolve) => setTimeout(resolve, mstime));
};

// Export constants and functions
export { BACKEND_URL, sleep };

const main = async () => {
    console.log("Loaded env variables");
};
interface TestAuthState {
    user: {
        isLoggedIn: boolean;
        userData: {
            data: {
                user: {
                    emailId: string;
                };
            };
        } | null;
        accountId: string | null;
    };
    projects?: {};
}
declare global {
    interface Window {
        __PLAYWRIGHT_TEST_AUTH_STATE__?: TestAuthState;
    }
}
export default main;
