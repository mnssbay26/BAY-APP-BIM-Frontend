import { expect } from "@playwright/test";
import { test } from "tests/fixtures/test.fixture";
import PlatformPage from "tests/pages/general/Platform.page";
import { mockBim360ProjectsData } from "tests/fixtures/bim360.fixture";
import { mockAccProjectsData } from "tests/fixtures/acc.fixture";

test.describe("Platform Page Navigation (not logged in)", () => {
    test("should navigate away if user not logged in", async ({ page }) => {
        const platformPage = new PlatformPage(page);
        await platformPage.navigate();
        console.log(platformPage.getCurrentUrl());
        // expect(await platformPage.navigate()).toThrowError(Error);
    });
});
test.describe("Platform Page Navigation (logged in)", () => {
    test("should not navigate away if user logged in", async ({
        loggedInPage,
    }) => {
        const platformPage = new PlatformPage(loggedInPage);

        await platformPage.navigate();
        const onPlatform = await platformPage.isOnPlatformPage();
        expect(onPlatform).toBeTruthy();
    });
    test("should display platform selection options", async ({
        loggedInPage,
    }) => {
        const platformPage = new PlatformPage(loggedInPage);

        await platformPage.navigate();
        await expect(platformPage.isLoaded()).resolves.toBeTruthy();

        // Verify title and subtitle
        const title = await platformPage.getTitle();
        expect(title).toBe("BAYER BIM APP");

        const subtitle = await platformPage.getSubtitle();
        expect(subtitle).toBe("Select a platform to continue");

        // Verify platform buttons are visible
        expect(await platformPage.isBim360ButtonVisible()).toBeTruthy();
        expect(await platformPage.isAccButtonVisible()).toBeTruthy();
    });

    test("should navigate to BIM 360 projects when BIM 360 button is clicked", async ({
        loggedInPage,
    }) => {
        const platformPage = new PlatformPage(loggedInPage);

        await platformPage.navigate();
        await platformPage.clickBim360Button();

        // Verify navigation to BIM 360 projects page
        const currentUrl = await platformPage.getCurrentUrl();
        expect(currentUrl).toContain("/bim360/projects");
    });
    test("on logged in, should navigate to BIM 360 projects when BIM 360 button is clicked and get expected page", async ({
        loggedInPage,
    }) => {
        await mockBim360ProjectsData(loggedInPage);

        const platformPage = new PlatformPage(loggedInPage);

        await platformPage.navigate();
        await platformPage.clickBim360Button();

        // Verify navigation to BIM 360 projects page
        const currentUrl = await platformPage.getCurrentUrl();
        expect(currentUrl).toContain("/bim360/projects");

        const isErrorScreen = await platformPage.isErrorScreen();
        expect(isErrorScreen).toBeFalsy();
    });

    test("should navigate to ACC projects when ACC button is clicked", async ({
        loggedInPage,
    }) => {
        const platformPage = new PlatformPage(loggedInPage);

        await platformPage.navigate();
        await platformPage.clickAccButton();

        // Verify navigation to ACC projects page
        const currentUrl = await platformPage.getCurrentUrl();
        expect(currentUrl).toContain("/acc/projects");
    });
    test("on logged in, should navigate to ACC projects when ACC button is clicked and get expected page", async ({
        loggedInPage,
    }) => {
        await mockAccProjectsData(loggedInPage);

        const platformPage = new PlatformPage(loggedInPage);

        await platformPage.navigate();
        await platformPage.clickAccButton();

        // Verify navigation to ACC projects page
        const currentUrl = await platformPage.getCurrentUrl();
        expect(currentUrl).toContain("/acc/projects");

        const isErrorScreen = await platformPage.isErrorScreen();
        expect(isErrorScreen).toBeFalsy();
    });
});
