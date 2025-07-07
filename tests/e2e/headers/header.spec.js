import { test, expect } from '@playwright/test';
import {loginUser, mockUserProfileAPI} from "../../fixtures/auth.fixture"
import { sleep } from '../../setup';
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

test.describe("header navigation in general.pages.header.jsx", () => {
    test("Navigate to / via BAYER CROP SCIENCE BIM APP", async ({page}) => {
        await page.goto("/login")
        const link = page.locator("a", {hasText: "BAYER CROP SCIENCE BIM APP"})
        await link.click()
        expect(page).toHaveURL("/")
    })
    test("Navigate to / via Home", async ({page}) => {
        await page.goto("/login")
        const link = page.locator("a", {hasText: "Home"})
        await link.click()
        expect(page).toHaveURL("/")
    })
    test("Navigate to /login via Login", async ({page}) => {
        await page.goto("/")
        const link = page.locator("a", {hasText: "Login"})
        await link.click()
        expect(page).toHaveURL("/login")
    })
})

test.describe("platform.access.header.jsx display", () => {
    test.beforeEach(async({page}) => {
        await mockUserProfileAPI(page)
        await loginUser(page)
    })
    test("profile svg exists", async({page}) => {
        await page.goto("/platform")
        const icon = page.locator(`button:has(svg)`)
        const iconExists = await icon.count() === 1 
        expect(iconExists).toBeTruthy()
    })
    test("username as email exists", async({page}) => {
        await page.goto("/platform", {waitUntil:"networkidle"})
        const header = page.locator("header")
        await expect(header).toContainText("@bayer.com", {useInnerText:true})
    })
})
test.describe("platform.access.header.jsx profile button press", () => {
    test.beforeEach(async({page}) => {
        await mockUserProfileAPI(page)
        await loginUser(page)
    })
    test("profile svg on click makes hidden options visible", async({page}) => {
        await page.goto("/platform")

        const selectPlatformBtn = page.locator("button", {hasText: "Select Platform"})
        await expect(selectPlatformBtn).toBeHidden()
        const signinPageBtn = page.locator("button", {hasText: "Signin Page"})
        await expect(signinPageBtn).toBeHidden()
        const logoutBtn = page.locator("button", {hasText: "Logout"})
        await expect(logoutBtn).toBeHidden()

        const icon = page.locator(`button:has(svg)`)
        await icon.click()

        await expect(selectPlatformBtn).toBeVisible()
        await expect(signinPageBtn).toBeVisible()
        await expect(logoutBtn).toBeVisible()
    })
    test ("Nav to /platform from profile svg click > Select Platform ", async({page}) => {
        await page.goto("/")
        const icon = page.locator(`button:has(svg)`)
        await icon.click()

        const selectPlatformBtn = page.locator("button", {hasText: "Select Platform"})
        await expect(selectPlatformBtn).toBeVisible()
        await selectPlatformBtn.click()

        expect(page).toHaveURL("/platform")
    }) 
    test ("Nav to /login from profile svg click > Signin Page", async({page}) => {
        await page.goto("/")
        const icon = page.locator(`button:has(svg)`)
        await icon.click()

        const selectPlatformBtn = page.locator("button", {hasText: "Signin Page"})
        await expect(selectPlatformBtn).toBeVisible()
        await selectPlatformBtn.click()

        expect(page).toHaveURL("/login")
    }) 
    test ("Nav to / from profile svg click > Logout", async({page}) => {
        await page.goto("/")
        const icon = page.locator(`button:has(svg)`)
        await icon.click()

        const selectPlatformBtn = page.locator("button", {hasText: "Logout"})
        await expect(selectPlatformBtn).toBeVisible()
        await selectPlatformBtn.click()

        expect(page).toHaveURL("/")
    }) 
})
test.describe("header navigation in platform.access.header.jsx (not from profile svg)", () => {
    test.beforeEach(async({page}) => {
        await mockUserProfileAPI(page)
        await loginUser(page)
    })
    test("Navigate to / via BAYER CROP SCIENCE BIM APP", async ({page}) => {
        await page.goto("/platform")
        const link = page.locator("a", {hasText: "BAYER CROP SCIENCE BIM APP"})
        await link.click()
        expect(page).toHaveURL("/")
    })
    test("Navigate to / via Home", async ({page}) => {
        await page.goto("/platform")
        const link = page.locator("a", {hasText: "Home"})
        await link.click()
        expect(page).toHaveURL("/")
    })
})