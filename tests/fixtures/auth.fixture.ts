import { Page } from "@playwright/test";

import { BACKEND_URL } from "../setup";

export async function mockUserProfileAPI(
    page: Page,
    userData?: { data: { user: { emailId: string } } }
) {
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

export async function mockUserLogoutAPI(page: Page) {
    const routeUrl = `${BACKEND_URL}/auth/logout`;
    await page.route(routeUrl, async (route) => {
        const loginUrl = `${BACKEND_URL}/general/user/profile`;

        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true }),
        });

        // after login run, set the login functionality to not work
        await page.unroute(loginUrl);
        await page.route(loginUrl, async (loginRoute) => {
            await loginRoute.fulfill({ status: 401 });
        });
    });
}

export async function loginUser(
    page: Page,
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
