import { expect } from "@playwright/test";
import { test } from "../../fixtures/auth.fixture";
test.describe("Correct header based on login state and destination", () => {
    test("correct header (not logged in, /)", async ({ page }) => {
        await page.goto("/");
        const header = page.locator("header");
        await expect(header).toHaveText(
            "BAYER CROP SCIENCE BIM APP Home Login",
            { useInnerText: true }
        );
    });
    test("correct header (is logged in, /)", async ({ loggedInPage }) => {
        await loggedInPage.goto("/");
        const header = loggedInPage.locator("header");
        await expect(header).toContainText("@bayer.com", {
            useInnerText: true,
        });
    });
    test("correct header (not logged in, /login)", async ({ page }) => {
        await page.goto("/login");
        const header = page.locator("header");
        await expect(header).toHaveText(
            "BAYER CROP SCIENCE BIM APP Home Login",
            { useInnerText: true }
        );
    });
    test("correct header (is logged in, /login)", async ({ loggedInPage }) => {
        await loggedInPage.goto("/login");
        const header = loggedInPage.locator("header");
        await expect(header).toContainText("@bayer.com", {
            useInnerText: true,
        });
    });
});

test.describe("header navigation in general.pages.header.jsx", () => {
    test("Navigate to / via BAYER CROP SCIENCE BIM APP", async ({ page }) => {
        await page.goto("/login");
        const link = page.locator("a", {
            hasText: "BAYER CROP SCIENCE BIM APP",
        });
        await link.click();
        expect(page).toHaveURL("/");
    });
    test("Navigate to / via Home", async ({ page }) => {
        await page.goto("/login");
        const link = page.locator("a", { hasText: "Home" });
        await link.click();
        expect(page).toHaveURL("/");
    });
    test("Navigate to /login via Login", async ({ page }) => {
        await page.goto("/");
        const link = page.locator("a", { hasText: "Login" });
        await link.click();
        expect(page).toHaveURL("/login");
    });
});

test.describe("platform.access.header.jsx display", () => {
    test("profile svg exists", async ({ loggedInPage }) => {
        await loggedInPage.goto("/platform", { waitUntil: "networkidle" });
        const icon = loggedInPage.locator(`button:has(svg)`);
        const iconExists = (await icon.count()) === 1;
        expect(iconExists).toBeTruthy();
    });
    test("username as email exists", async ({ loggedInPage }) => {
        await loggedInPage.goto("/platform", { waitUntil: "networkidle" });
        const header = loggedInPage.locator("header");
        await expect(header).toContainText("@bayer.com", {
            useInnerText: true,
        });
    });
});
test.describe("platform.access.header.jsx profile button press", () => {
    test("profile svg on click makes hidden options visible", async ({
        loggedInPage,
    }) => {
        await loggedInPage.goto("/", { waitUntil: "networkidle" });

        const selectPlatformBtn = loggedInPage.locator("button", {
            hasText: "Select Platform",
        });
        const signinPageBtn = loggedInPage.locator("button", {
            hasText: "Signin Page",
        });
        const logoutBtn = loggedInPage.locator("button", { hasText: "Logout" });
        await expect(selectPlatformBtn).toBeHidden();
        await expect(signinPageBtn).toBeHidden();
        await expect(logoutBtn).toBeHidden();

        const icon = loggedInPage.locator(`button:has(svg)`);
        await icon.click({ waitUntil: "networkidle" });

        await expect(selectPlatformBtn).toBeVisible();
        await expect(signinPageBtn).toBeVisible();
        await expect(logoutBtn).toBeVisible();
    });
    test("Nav to /platform from profile svg click > Select Platform ", async ({
        loggedInPage,
    }) => {
        // const page = loggedInPage
        await loggedInPage.goto("/", { waitUntil: "networkidle" });
        const icon = loggedInPage.locator(`button:has(svg)`);
        await expect(icon).toBeVisible();
        await icon.click();

        const selectPlatformBtn = loggedInPage.locator("button", {
            hasText: "Select Platform",
        });
        await expect(selectPlatformBtn).toBeVisible();
        await selectPlatformBtn.click();

        expect(loggedInPage).toHaveURL("/platform");
    });
    test("Nav to /login from profile svg click > Signin Page", async ({
        loggedInPage,
    }) => {
        await loggedInPage.goto("/");
        const icon = loggedInPage.locator(`button:has(svg)`);
        await icon.click();

        const selectPlatformBtn = loggedInPage.locator("button", {
            hasText: "Signin Page",
        });
        await expect(selectPlatformBtn).toBeVisible();
        await selectPlatformBtn.click();

        await expect(loggedInPage).toHaveURL("/login");
    });
    test("Nav to / from profile svg click > Logout", async ({
        loggedInPage,
    }) => {
        await loggedInPage.goto("/platform", { waitUntil: "networkidle" });
        const icon = loggedInPage.locator(`button:has(svg)`);
        await icon.click();

        const selectPlatformBtn = loggedInPage.locator("button", {
            hasText: "Logout",
        });
        await expect(selectPlatformBtn).toBeVisible();
        await selectPlatformBtn.click();

        await expect(loggedInPage).toHaveURL("/");
    });
});
test.describe("header navigation in platform.access.header.jsx (not from profile svg)", () => {
    test("Navigate to / via BAYER CROP SCIENCE BIM APP", async ({
        loggedInPage,
    }) => {
        await loggedInPage.goto("/platform");
        const link = loggedInPage.locator("a", {
            hasText: "BAYER CROP SCIENCE BIM APP",
        });
        await link.click();
        expect(loggedInPage).toHaveURL("/");
    });
    test("Navigate to / via Home", async ({ loggedInPage }) => {
        await loggedInPage.goto("/platform");
        const link = loggedInPage.locator("a", { hasText: "Home" });
        await link.click();
        expect(loggedInPage).toHaveURL("/");
    });
});
