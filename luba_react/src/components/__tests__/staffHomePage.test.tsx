import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import StaffHomePage from "../staffHomePage";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock("@/utils/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "staff-id" } },
          error: null,
        })
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              })
            ),
          })),
        })),
      })),
    })),
  },
}));

describe("StaffHomePage Component", () => {
  const mockPush = jest.fn();
  const mockWindowLocation = window.location;

  beforeAll(() => {
    Object.defineProperty(window, "location", {
      value: {
        href: "",
        assign: jest.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      value: mockWindowLocation,
    });
  });

  it("renders without crashing", async () => {
    await act(async () => {
      render(<StaffHomePage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Lab Management")).toBeInTheDocument();
    });
  });

  it("redirects to login if no user is authenticated", async () => {
    const { supabase } = require("@/utils/supabaseClient");
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("Not authenticated"),
    });

    await act(async () => {
      render(<StaffHomePage />);
    });

    await waitFor(
      () => {
        expect(window.location.href).toBe("/loginStaff");
      },
      { timeout: 3000 }
    );
  });
});
