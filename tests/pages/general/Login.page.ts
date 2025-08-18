import { Page, Locator } from "@playwright/test";
class LoginPage {
    private page: Page;
    private pageContainer: Locator;
    private header: Locator;
    private title: Locator;
    private subtitle: Locator;
    private loginWithAutodeskButton: Locator;
    private logoutButton: Locator;
    private selectPlatformButton: Locator;
    private bayerLogo: Locator;
    private headerTitle: Locator;
    /**
     * @param {import('@playwright/test').Page} page - Playwright page object
     */
    constructor(page: Page) {
        this.page = page;

        // Define selectors for key elements
        this.pageContainer = page.locator(".min-h-screen");
        this.header = page.locator("header"); // Assuming BayerHeader renders a header element

        // Title and subtitle
        this.title = page.locator("h1.text-5xl");
        this.subtitle = page.locator("h2.text-2xl");

        // Buttons - using aria-label for more reliable selection
        this.loginWithAutodeskButton = page.getByRole("button", {
            name: "Login with Autodesk",
        });
        this.logoutButton = page.getByRole("button", {
            name: "Logout from Autodesk",
        });
        this.selectPlatformButton = page.getByRole("button", {
            name: "Go to platform selection",
        });

        // Additional selectors for BayerHeader elements (assuming structure)
        this.bayerLogo = page.locator('header img[alt*="Bayer"]');
        this.headerTitle = page.getByText("BAYER CROP SCIENCE BIM APP", {
            exact: false,
        });
    }

    async navigate() {
        await this.page.goto("/login");
    }

    async clickLoginWithAutodesk() {
        await this.loginWithAutodeskButton.click();
        // Note: This will navigate away from your app to Autodesk's auth page
    }

    async clickLogout() {
        await this.logoutButton.click();
        // Wait for navigation to home page after logout
        await this.page.waitForURL("/");
    }

    async clickSelectPlatform() {
        await this.selectPlatformButton.click();
        // Wait for navigation to platform page
        await this.page.waitForURL("/platform");
    }

    async getTitle() {
        return await this.title.textContent();
    }

    async getSubtitle() {
        return await this.subtitle.textContent();
    }

    async isLoaded() {
        await this.pageContainer.waitFor({ state: "visible" });
        await this.title.waitFor({ state: "visible" });
        return await this.pageContainer.isVisible();
    }

    async isLoginButtonVisible() {
        return await this.loginWithAutodeskButton.isVisible();
    }

    async isLogoutButtonVisible() {
        return await this.logoutButton.isVisible();
    }

    async isSelectPlatformButtonVisible() {
        return await this.selectPlatformButton.isVisible();
    }

    async isUserLoggedIn() {
        return await this.isLogoutButtonVisible();
    }

    async getCurrentUrl() {
        return this.page.url();
    }
}

export default LoginPage;
