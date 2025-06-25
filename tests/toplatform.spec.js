// @ts-check
import { test, expect, chromium } from '@playwright/test';

async function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

test('has title', async ({ page }) => {
    await page.goto('localhost:5173/platform')
    await sleep(50000)
});