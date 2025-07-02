// tests/setup.js
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load constants
const BACKEND_URL = process.env.VITE_API_BACKEND_BASE_URL;

// Utility function
const sleep = async (seconds) => {
    const mstime = seconds * 1000;
    return new Promise(resolve => setTimeout(resolve, mstime));
};

// Export constants and functions
export { BACKEND_URL, sleep };

const main = async() => {
    console.log("Loaded env variables")
}

export default main