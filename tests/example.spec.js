// @ts-check
import { test, expect, chromium } from '@playwright/test';

async function sleep(time){
  return new Promise(resolve => setTimeout(resolve, time))
}

test('has title', async ({ page }) => {
  await page.goto('localhost:5173')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/BAYER BIM APP/);

  // Click the get started link.
  const loginLink = page.getByRole('link', { name: 'Login' })
  expect(loginLink).toBeDefined()
  await loginLink.click()
  await page.waitForLoadState("load")
  expect(page.url()).toBe("http://localhost:5173/login")
  const autodeskLink = page.getByLabel("Login with Autodesk")
  expect(autodeskLink).toBeDefined()
  await autodeskLink.click()
  // Perform login
  await page.fill('input[name="UserName"]', 'james.williams1.ext@bayer.com');
  const nextButton = page.getByLabel("Next button")
  await nextButton.click()
  await page.waitForLoadState("load")
  await page.fill('input[name="loginfmt"]', 'james.williams1.ext@bayer.com');
  await page.click('input[type="submit"]');
  // await page.fill('input[name="passwd"]', 'your-password');
  await page.click('#allow_btn')
  await sleep(500000)

});