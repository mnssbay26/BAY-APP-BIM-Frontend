/**
 * Page Object Model for the Login page
 */
class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page - Playwright page object
     */
    constructor(page) {
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

    /**
     * Navigate to the Login page
     * @returns {Promise<void>}
     */
    async navigate() {
        await this.page.goto("/login");
    }

    /**
     * Click the "Login with Autodesk" button
     * This will redirect to Autodesk OAuth page
     * @returns {Promise<void>}
     */
    async clickLoginWithAutodesk() {
        await this.loginWithAutodeskButton.click();
        // Note: This will navigate away from your app to Autodesk's auth page
    }

    /**
     * Click the Logout button
     * @returns {Promise<void>}
     */
    async clickLogout() {
        await this.logoutButton.click();
        // Wait for navigation to home page after logout
        await this.page.waitForURL("/");
    }

    /**
     * Click the Select Platform button
     * @returns {Promise<void>}
     */
    async clickSelectPlatform() {
        await this.selectPlatformButton.click();
        // Wait for navigation to platform page
        await this.page.waitForURL("/platform");
    }

    /**
     * Get the title text
     * @returns {Promise<string>}
     */
    async getTitle() {
        return await this.title.textContent();
    }

    /**
     * Get the subtitle text
     * @returns {Promise<string>}
     */
    async getSubtitle() {
        return await this.subtitle.textContent();
    }

    /**
     * Check if the page is loaded and visible
     * @returns {Promise<boolean>}
     */
    async isLoaded() {
        await this.pageContainer.waitFor({ state: "visible" });
        await this.title.waitFor({ state: "visible" });
        return await this.pageContainer.isVisible();
    }

    /**
     * Check if the Login with Autodesk button is visible
     * (indicates logged out state)
     * @returns {Promise<boolean>}
     */
    async isLoginButtonVisible() {
        return await this.loginWithAutodeskButton.isVisible();
    }

    /**
     * Check if the Logout button is visible
     * (indicates logged in state)
     * @returns {Promise<boolean>}
     */
    async isLogoutButtonVisible() {
        return await this.logoutButton.isVisible();
    }

    /**
     * Check if the Select Platform button is visible
     * (indicates logged in state)
     * @returns {Promise<boolean>}
     */
    async isSelectPlatformButtonVisible() {
        return await this.selectPlatformButton.isVisible();
    }

    /**
     * Check if user is logged in based on UI elements
     * @returns {Promise<boolean>}
     */
    async isUserLoggedIn() {
        return await this.isLogoutButtonVisible();
    }

    /**
     * Get the current URL
     * @returns {Promise<string>}
     */
    async getCurrentUrl() {
        return this.page.url();
    }
}

export default LoginPage;
