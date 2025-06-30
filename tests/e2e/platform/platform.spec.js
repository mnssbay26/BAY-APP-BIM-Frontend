import { test, expect } from '@playwright/test';
import PlatformPage from '../../pages/general/Platform.page';
import { loginUser, mockUserProfileAPI } from '../../fixtures/auth.fixture';

async function sleep(seconds) {
    const mstime = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, mstime))
}

test.describe('Platform Page Navigation', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
        });
        await mockUserProfileAPI(page)
        // Ensure user is logged in before accessing platform page
        await loginUser(page);


    });

    test('should display platform selection options', async ({ page }) => {
        const platformPage = new PlatformPage(page);

        await platformPage.navigate();
        await expect(platformPage.isLoaded()).resolves.toBeTruthy();

        // Verify title and subtitle
        const title = await platformPage.getTitle();
        expect(title).toBe('BAYER BIM APP');

        const subtitle = await platformPage.getSubtitle();
        expect(subtitle).toBe('Select a platform to continue');

        // Verify platform buttons are visible
        expect(await platformPage.isBim360ButtonVisible()).toBeTruthy();
        expect(await platformPage.isAccButtonVisible()).toBeTruthy();
    });

    test('should navigate to BIM 360 projects when BIM 360 button is clicked', async ({ page }) => {
      const platformPage = new PlatformPage(page);
      
      await platformPage.navigate();
      await platformPage.clickBim360Button();
      
      // Verify navigation to BIM 360 projects page
      const currentUrl = await platformPage.getCurrentUrl();
      expect(currentUrl).toContain('/bim360/projects');
    });
  
    test('should navigate to ACC projects when ACC button is clicked', async ({ page }) => {
      const platformPage = new PlatformPage(page);
      
      await platformPage.navigate();
      await platformPage.clickAccButton();
      
      // Verify navigation to ACC projects page
      const currentUrl = await platformPage.getCurrentUrl();
      expect(currentUrl).toContain('/acc/projects');
    });
});