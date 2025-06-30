// tests/fixtures/auth.fixture.js
import { test as base } from '@playwright/test';

import dotenv from "dotenv"
dotenv.config()

const BACKEND_URL = process.env.VITE_API_BACKEND_BASE_URL

async function sleep(seconds) {
    const mstime = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, mstime))
}
/**
 * Logs in a user by setting the necessary authentication cookies/storage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Login options
 * @param {string} options.tokenName - The name of the auth token cookie (default: 'token')
 * @param {string} options.tokenValue - The value of the auth token (default: 'mock-autodesk-token')
 * @returns {Promise<void>}
 */
export async function loginUser(page, { tokenName = 'token', tokenValue = 'mock-autodesk-token' } = {}) {
    // Navigate to a page in your app first (required for setting cookies)
    await page.goto('/');
    // Set authentication cookie
    await page.context().addCookies([
        {
            name: tokenName,
            value: tokenValue,
            url: page.url(),
        }
    ]);

    // Refresh to apply the authentication state
    await page.reload();
    await page.waitForLoadState('networkidle');

}

/**
 * Logs out a user by clearing authentication cookies/storage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function logoutUser(page) {
    // Clear cookies
    await page.context().clearCookies();

    // Clear localStorage
    await page.evaluate(() => {
        localStorage.clear();
        console.log('Cleared localStorage');
    });

    // Refresh to apply the changes
    await page.reload();
    await page.waitForLoadState('networkidle');

    const loggedIn = await isLoggedIn(page)
    if (loggedIn) {
        console.warn("It does not appear logout was successful...")
    } else {
        console.log("Log out successful!")
    }
}

/**
 * Creates a test fixture for authenticated state
 * This allows you to use { loggedInPage } in your test parameters
 */
export const test = base.extend({
    loggedInPage: async ({ page }, use) => {
        // Log in before running the test
        await loginUser(page);

        // Use the authenticated page in the test
        await use(page);

        // Optional: Log out after the test
        // await logoutUser(page);
    },
});

/**
 * Helper function to check if a user is currently logged in
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn(page) {

    // Check if "Log In" text is NOT present in the header
    const header = page.locator("header")
    const headerTextContent = await header.textContent()
    const loginText = header.getByText('Login', { exact: true });
    return !(await loginText.isVisible());
}


/**
 * Mocks the user profile API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} userData - User data to return
 */
export async function mockUserProfileAPI(page, userData) {
    const fakeData = { data: { user: { emailId: "fakeemail@bayer.com" } } }
    if (!userData){
        userData = fakeData
    }
    const route_url = `${BACKEND_URL}/general/user/profile`
    await page.route(route_url, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(userData)
        });
    });
}