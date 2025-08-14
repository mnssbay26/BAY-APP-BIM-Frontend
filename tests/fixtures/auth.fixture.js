import { BACKEND_URL } from "../setup";

/**
 * Mocks the user profile API response
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} userData - User data to return
 */
export async function mockUserProfileAPI(page, userData) {
    const fakeData = { data: { user: { emailId: "fakeemail@bayer.com" } } };
    if (!userData) {
        userData = fakeData;
    }
    const route_url = `${BACKEND_URL}/general/user/profile`;
    await page.route(route_url, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(userData),
        });
    });
}

/**
 * Logs in a user by setting the necessary authentication cookies/storage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Login options
 * @param {string} options.tokenName - The name of the auth token cookie (default: 'token')
 * @param {string} options.tokenValue - The value of the auth token (default: 'mock-autodesk-token')
 * @returns {Promise<void>}
 */
export async function loginUser(
    page,
    { tokenName = "token", tokenValue = "mock-autodesk-token" } = {}
) {
    // Navigate to a page in app first (required for setting cookies)
    await page.goto("/");
    // Set authentication cookie
    await page.context().addCookies([
        {
            name: tokenName,
            value: tokenValue,
            url: page.url(),
        },
    ]);

    // Refresh to apply the authentication state
    await page.reload();
    await page.waitForLoadState("networkidle");
}
