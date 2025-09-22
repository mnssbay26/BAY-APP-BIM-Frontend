import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import GeneralHeader from "./general-header";
import * as useUserSession from "@/hooks/useUserSession";
import { vi } from "vitest";

// Mock the child components
vi.mock("./left_headers/no-platform-header-left", () => ({
    default: () => (
        <div data-testid="no-platform-header-left">No Platform Header Left</div>
    ),
}));

vi.mock("./left_headers/platform-header-left", () => ({
    default: () => (
        <div data-testid="platform-header-left">Platform Header Left</div>
    ),
}));

vi.mock("./right_headers/logged-in-header-right", () => ({
    default: ({ userProfile }) => (
        <div data-testid="logged-in-header-right">
            Logged In Header Right - {userProfile.name}
        </div>
    ),
}));

vi.mock("./right_headers/logged-out-header-right", () => ({
    default: () => (
        <div data-testid="logged-out-header-right">Logged Out Header Right</div>
    ),
}));

// Create a mock store, with argument being
const createMockStore = ({ isAcc }) => {
    return configureStore({
        reducer: {
            isAcc: (state = isAcc) => state,
        },
    });
};

describe("GeneralHeader", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders header with correct base classes and role", () => {
        const mockStore = createMockStore({ isAcc: null });
        vi.spyOn(useUserSession, "useUserSession").mockReturnValue({
            userProfile: null,
        });

        render(
            <Provider store={mockStore}>
                <GeneralHeader />
            </Provider>
        );

        const header = screen.getByRole("banner");
        expect(header).toHaveClass(
            "fixed",
            "top-0",
            "left-0",
            "z-50",
            "w-full",
            "h-16"
        );
    });

    it("shows NoPlatformHeaderLeft and LoggedOutHeaderRight when no platform selected and not logged in", () => {
        const mockStore = createMockStore({ isAcc: null });
        vi.spyOn(useUserSession, "useUserSession").mockReturnValue({
            userProfile: null,
        });

        render(
            <Provider store={mockStore}>
                <GeneralHeader />
            </Provider>
        );

        expect(
            screen.getByTestId("no-platform-header-left")
        ).toBeInTheDocument();
        expect(
            screen.getByTestId("logged-out-header-right")
        ).toBeInTheDocument();
    });

    it("shows NoPlatformHeaderLeft and LoggedInHeaderRight when platform selected and logged in", () => {
        const mockStore = createMockStore({ isAcc: null });
        const mockUser = { name: "John Doe" };
        vi.spyOn(useUserSession, "useUserSession").mockReturnValue({
            userProfile: mockUser,
        });

        render(
            <Provider store={mockStore}>
                <GeneralHeader />
            </Provider>
        );

        expect(
            screen.getByTestId("no-platform-header-left")
        ).toBeInTheDocument();
        expect(
            screen.getByTestId("logged-in-header-right")
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Logged In Header Right - ${mockUser.name}`)
        ).toBeInTheDocument();
    });

    it("shows PlatformHeaderLeft and LoggedInHeaderRight when platform selected and logged in", () => {
        const mockStore = createMockStore({ isAcc: false });
        const mockUser = { name: "John Doe" };
        vi.spyOn(useUserSession, "useUserSession").mockReturnValue({
            userProfile: mockUser,
        });

        render(
            <Provider store={mockStore}>
                <GeneralHeader />
            </Provider>
        );

        expect(screen.getByTestId("platform-header-left")).toBeInTheDocument();
        expect(
            screen.getByTestId("logged-in-header-right")
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Logged In Header Right - ${mockUser.name}`)
        ).toBeInTheDocument();
    });
});
