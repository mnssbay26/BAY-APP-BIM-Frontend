import { test, expect } from '@playwright/test';
import {mockUserProfileAPI} from "../../fixtures/auth.fixture"
test.describe('Correct header based on login state and destination', () => {
    test("correct header (not logged in, /)", async ({page}) => {
        await page.goto("/")
        const header = page.locator('header')
        await expect(header).toHaveText("BAYER CROP SCIENCE BIM APP Home Login", {useInnerText:true})
    })
    test("correct header (is logged in, /)", async ({page}) => {
        await page.goto("/")
        await mockUserProfileAPI(page)
        const header = page.locator('header')
        await expect(header).toContainText("@bayer.com", {useInnerText:true})
    })
    test("correct header (not logged in, /login)", async ({page}) => {
        await page.goto("/login")
        const header = page.locator('header')
        await expect(header).toHaveText("BAYER CROP SCIENCE BIM APP Home Login", {useInnerText:true})

    })
    test("correct header (is logged in, /login)", async ({page}) => {
        await page.goto("/login")
        await mockUserProfileAPI(page)
        const header = page.locator('header')
        await expect(header).toContainText("@bayer.com", {useInnerText:true})

    })
});