/**
 * Page Object Model for the Platform selection page
 */
class PlatformPage {
    /**
     * @param {import('@playwright/test').Page} page - Playwright page object
     */
    constructor(page) {
        this.page = page;

        // Define selectors for key elements
        this.pageContainer = page.locator('.min-h-screen');
        this.header = page.locator('header'); // Assuming PlatformHeader renders a header element

        // Title and subtitle
        this.title = page.locator('h1#platform-title');
        this.subtitle = page.locator('h2.text-2xl');

        // Platform selection buttons - using aria-label for more reliable selection
        this.bim360Button = page.getByRole('button', { name: 'Go to BIM 360 projects' });
        this.accButton = page.getByRole('button', { name: 'Go to Autodesk Construction Cloud projects' });

        // Additional selectors for PlatformHeader elements (assuming structure)
        this.platformLogo = page.locator('header img[alt*="Bayer"]');
        this.headerTitle = page.getByText('BAYER CROP SCIENCE BIM APP', { exact: false });
        this.profileButton = page.locator('[data-testid="profile-button"]'); // Assuming there's a profile button
    }

    /**
     * Navigate to the Platform page
     * @returns {Promise<void>}
     */
    async navigate() {
        await this.page.goto('/platform');
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Click the BIM 360 button to navigate to BIM 360 projects
     * @returns {Promise<void>}
     */
    async clickBim360Button() {
        await this.bim360Button.click();
        // Wait for navigation to complete
        await this.page.waitForURL('/bim360/projects**');
    }

    /**
     * Click the ACC button to navigate to ACC projects
     * @returns {Promise<void>}
     */
    async clickAccButton() {
        await this.accButton.click();
        // Wait for navigation to complete
        await this.page.waitForURL('/acc/projects**');
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
        await this.pageContainer.waitFor({ state: 'visible' });
        await this.title.waitFor({ state: 'visible' });
        return await this.pageContainer.isVisible();
    }

    /**
     * Check if the BIM 360 button is visible
     * @returns {Promise<boolean>}
     */
    async isBim360ButtonVisible() {
        return await this.bim360Button.isVisible();
    }

    /**
     * Check if the ACC button is visible
     * @returns {Promise<boolean>}
     */
    async isAccButtonVisible() {
        return await this.accButton.isVisible();
    }

    /**
     * Get the current URL
     * @returns {Promise<string>}
     */
    async getCurrentUrl() {
        return this.page.url();
    }

    /**
     * Check if query parameters are preserved when navigating
     * @param {string} queryParams - The query parameters to check (e.g., '?param=value')
     * @param {string} destination - The destination to navigate to ('bim360' or 'acc')
     * @returns {Promise<boolean>}
     */
    async checkQueryParamPreservation(queryParams, destination = 'bim360') {
        // Navigate to platform page with query params
        await this.page.goto(`/platform${queryParams}`);
        await this.page.waitForLoadState('networkidle');

        // Click the appropriate button
        if (destination === 'bim360') {
            await this.clickBim360Button();
        } else {
            await this.clickAccButton();
        }

        // Check if the current URL contains the query params
        const currentUrl = await this.getCurrentUrl();
        return currentUrl.includes(queryParams);
    }

    /**
     * Mock the login state by setting cookies
     * Useful for testing the platform page which requires authentication
     * @param {string} token - The token value to set
     * @returns {Promise<void>}
     */
    async mockLoggedInState(token = 'mock-token') {
        // Navigate to the platform page first
        await this.page.goto('/platform');

        // Set the cookie
        await this.page.context().addCookies([
            {
                name: 'token', // Make sure this matches what your app expects
                value: token,
                url: this.page.url(),
            }
        ]);

        // Refresh the page to apply the cookie
        await this.page.reload();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Check if user is logged in based on UI elements
     * @returns {Promise<boolean>}
     */
    async isUserLoggedIn() {
        // This implementation depends on how your UI indicates logged-in state
        // For example, if the profile button is only visible when logged in:
        return await this.profileButton.isVisible();
    }
}

export default PlatformPage;