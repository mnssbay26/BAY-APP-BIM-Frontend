import { test as base, Page, TestFixture } from "@playwright/test";
import {
    mockUserProfileAPI,
    loginUser,
    mockUserLogoutAPI,
} from "./auth.fixture";
import {
    mockBim360ProjectsData,
    mockBim360ProjectData,
} from "./bim360.fixture";

interface CustomFixtures {
    loggedInPage: Page;
    loggedInPageBim360Platform: Page;
    loggedInPageAccPlatform: Page;
}

// extends playwright test
export const test = base.extend<CustomFixtures>({
    loggedInPage: async ({ page }, use) => {
        await page.addInitScript(() => {
            window.__PLAYWRIGHT_TEST_AUTH_STATE__ = {
                user: {
                    isLoggedIn: true,
                    userData: {
                        data: { user: { emailId: "testing@bayer.com" } },
                    },
                    accountId: "something",
                },
            };
        });

        await mockUserProfileAPI(page);
        await mockUserLogoutAPI(page);
        await mockBim360ProjectsData(page);
        await mockBim360ProjectData(page);

        // Log in before running the test
        await loginUser(page);

        // Use the authenticated page in the test
        await use(page);
    },
    loggedInPageBim360Platform: async ({ page }, use) => {
        await page.addInitScript(() => {
            window.__PLAYWRIGHT_TEST_AUTH_STATE__ = {
                user: {
                    isLoggedIn: true,
                    userData: {
                        data: { user: { emailId: "testing@bayer.com" } },
                    },
                    accountId: "something",
                },
                projects: {
                    projects: [],
                    isAcc: false,
                },
            };
        });

        await mockUserProfileAPI(page);
        await mockUserLogoutAPI(page);
        await mockBim360ProjectsData(page);
        await mockBim360ProjectData(page);

        // Log in before running the test
        await loginUser(page);

        // Use the authenticated page in the test
        await use(page);
    },
    loggedInPageAccPlatform: async ({ page }, use) => {
        await page.addInitScript(() => {
            window.__PLAYWRIGHT_TEST_AUTH_STATE__ = {
                user: {
                    isLoggedIn: true,
                    userData: {
                        data: { user: { emailId: "testing@bayer.com" } },
                    },
                    accountId: "something",
                },
                projects: {
                    projects: [],
                    isAcc: true,
                },
            };
        });

        await mockUserProfileAPI(page);
        await mockUserLogoutAPI(page);
        await mockBim360ProjectsData(page);
        await mockBim360ProjectData(page);

        // Log in before running the test
        await loginUser(page);

        // Use the authenticated page in the test
        await use(page);
    },
});
