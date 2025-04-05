import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import StudentBookingDashboard from "../studentHome"; // Adjust path as needed
import { supabase } from "../../utils/supabaseClient"; // Adjust path as needed
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock("../../utils/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "student-id", email: "student@example.com" } },
          error: null,
        })
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock labs data
const mockLabs = [
  { lab_id: "1", lab_name: "Lab 1", location: "Building A", capacity: 10 },
  { lab_id: "2", lab_name: "Lab 2", location: "Building B", capacity: 5 },
];

describe("StudentBookingDashboard Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    // Mock labs and bookings fetch
    (supabase.from as jest.Mock).mockImplementation((table) => ({
      select: jest.fn(() => {
        if (table === "labs") {
          return Promise.resolve({ data: mockLabs, error: null });
        }
        if (table === "student_bookings") {
          return { eq: jest.fn(() => Promise.resolve({ data: [], error: null })) };
        }
        return Promise.resolve({ data: [], error: null });
      }),
    }));
  });

  it("renders without crashing", async () => {
    await act(async () => {
      render(<StudentBookingDashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText("Student Booking Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Available Labs")).toBeInTheDocument();
    });
  });

  it("displays labs when loaded", async () => {
    await act(async () => {
      render(<StudentBookingDashboard />);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Lab 1")).toBeInTheDocument();
        expect(screen.getByText("Building A")).toBeInTheDocument();
        expect(screen.getByText("Lab 2")).toBeInTheDocument();
        expect(screen.getByText("Building B")).toBeInTheDocument();
      },
      { timeout: 2000 } // Increase timeout if needed
    );
  });

  it("redirects to login if no user is authenticated", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error("Not authenticated"),
    });

    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { replace: jest.fn() };

    await act(async () => {
      render(<StudentBookingDashboard />);
    });

    await waitFor(
      () => {
        expect(window.location.replace).toHaveBeenCalledWith("http://localhost:3000/loginStudent");
      },
      { timeout: 2000 }
    );

    window.location = originalLocation;
  });
});