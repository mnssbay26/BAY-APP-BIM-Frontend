import "@testing-library/jest-dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

// Extend Vitest's expect with Testing Library's matchers
expect.extend(matchers);
