// tests/e2e/authentication/login.spec.js
import { test, expect } from '@playwright/test';
import LoginPage from '../../pages/general/Login.page';

test.describe('Login Page - Logged Out', () => {
  test('should display login button when not logged in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await expect(loginPage.isLoaded()).resolves.toBeTruthy();
    
    // Verify title and subtitle
    const title = await loginPage.getTitle();
    expect(title).toBe('BAYER BIM APP');
    
    const subtitle = await loginPage.getSubtitle();
    expect(subtitle).toContain('Login with Autodesk');
    
    // Verify login button is visible
    expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
    expect(await loginPage.isLogoutButtonVisible()).toBeFalsy();
  });

  test('should redirect to Autodesk OAuth when login button is clicked', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.clickLoginWithAutodesk()
    
    
    const currentUrl = await loginPage.getCurrentUrl()
    expect(currentUrl).toContain('autodesk.com');
  });
});

test.describe("Login page - Logged in", () => {
    test("should be able to get /login even if logged in", async({page}) => {
        const loginPage = new LoginPage(page)

        await loginPage.mockLoggedInState()

        const currentUrl = await loginPage.getCurrentUrl()
        expect(currentUrl).toContain("/login")
    })
    test("should see different elements on logged in", async({page}) => {
        const loginPage = new LoginPage(page)

        await loginPage.mockLoggedInState()

        const logoutVisible = await loginPage.isLogoutButtonVisible()
        expect(logoutVisible).toBeTruthy()

        const title = await loginPage.getSubtitle()
        expect(title).toContain("Welcome back")


    })
})