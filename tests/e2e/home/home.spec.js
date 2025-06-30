// tests/e2e/home/home.spec.js
import { test, expect } from '@playwright/test';
import HomePage from '../../pages/general/Home.page';

test.describe('Home Page', () => {
  test('should display correct title and description', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.navigate();
    await expect(homePage.isLoaded()).resolves.toBeTruthy();
    
    const title = await homePage.getTitle();
    expect(title).toBe('BAYER BIM APP');
    
    const description = await homePage.getDescription();
    expect(description).toContain('The Bayer APP is a web application');
  });

  test('should navigate to login page when Get Started is clicked', async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.navigate();
    await homePage.clickGetStarted();
    
    // The URL should now be /login
    const currentUrl = await homePage.getCurrentUrl();
    expect(currentUrl).toContain('/login');
  });
});