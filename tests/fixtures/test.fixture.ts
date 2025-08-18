import { test as base, Page, TestFixture } from "@playwright/test";
import { mockUserProfileAPI, loginUser } from "./auth.fixture";

interface CustomFixtures {
    loggedInPage: Page;
}

// extends playwright test
export const test = base.extend<CustomFixtures>({
    loggedInPage: async ({ page }, use) => {
        await mockUserProfileAPI(page);

        // Log in before running the test
        await loginUser(page);

        // Use the authenticated page in the test
        await use(page);
    },
});
