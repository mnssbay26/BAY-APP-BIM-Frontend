/**
 * Page Object Model for the Home page
 */
class HomePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
    
    // Define selectors for key elements
    this.pageContainer = page.locator('.min-h-screen');
    this.header = page.locator('header'); // Assuming BayerHeader renders a header element
    this.title = page.locator('h1.text-5xl');
    this.description = page.locator('p.text-lg');
    this.getStartedButton = page.getByRole('button', { name: 'Get Started with Bayer BIM App' });
    
    // Additional selectors for BayerHeader elements (assuming structure)
    this.bayerLogo = page.locator('header img[alt*="Bayer"]');
    this.headerTitle = page.getByText('BAYER CROP SCIENCE BIM APP', { exact: false });
  }

  /**
   * Navigate to the Home page
   * @returns {Promise<void>}
   */
  async navigate() {
    await this.page.goto('/');
  }

  /**
   * Click the "Get Started" button to navigate to login
   * @returns {Promise<void>}
   */
  async clickGetStarted() {
    await this.getStartedButton.click();
    // Wait for navigation to complete
    await this.page.waitForURL('/login');
  }

  /**
   * Click on the Bayer logo/title in the header to navigate home
   * @returns {Promise<void>}
   */
  async clickHeaderTitle() {
    await this.headerTitle.click();
  }

  /**
   * Get the title text
   * @returns {Promise<string>}
   */
  async getTitle() {
    return await this.title.textContent();
  }

  /**
   * Get the description text
   * @returns {Promise<string>}
   */
  async getDescription() {
    return await this.description.textContent();
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
   * Check if the Get Started button is visible
   * @returns {Promise<boolean>}
   */
  async isGetStartedButtonVisible() {
    return await this.getStartedButton.isVisible();
  }

  /**
   * Get the current URL
   * @returns {Promise<string>}
   */
  async getCurrentUrl() {
    return this.page.url();
  }
}

export default HomePage;