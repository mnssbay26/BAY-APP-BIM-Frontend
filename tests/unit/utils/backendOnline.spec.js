import { expect } from "@playwright/test";
import { test } from "../../../tests/fixtures/test.fixture";
import { backendOnline } from "../../../src/utils/backendOnline";
import { BACKEND_URL } from "../../setup";

test.describe("Testing backendOnline behavior", () => {
    test("backendOnline does something", async () => {
        const result = await backendOnline(BACKEND_URL);
        expect(result).toBeTruthy();
    });
});
