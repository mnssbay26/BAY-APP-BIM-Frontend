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

        // for checking if error message displayed
        this.errorSelector = 'div.text-red-600'; // Selector for the error message
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

    // error screen if red text and 2 divs
    async isErrorScreen() {
        await this.page.waitForLoadState('domcontentloaded')
        const divs = await this.page.$$('div')
        const divCount = divs.length
        const containsErrorText = await this.page.textContent(this.errorSelector) 
        return containsErrorText && (divCount == 2)
    }
}

export default PlatformPage;