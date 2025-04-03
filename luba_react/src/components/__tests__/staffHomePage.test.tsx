// src/components/__tests__/staffHomePage.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StaffHomePage from '../staffHomePage';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('StaffHomePage Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'staff') {
        return JSON.stringify({ id: 'staff-id', email: 'staff@example.com' });
      }
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(<StaffHomePage />);
    await waitFor(() => {
      const dashboardElements = screen.getAllByText(/dashboard/i);
      expect(dashboardElements.length).toBeGreaterThan(0);
    });
  });

  // it('displays staff email in sidebar', async () => {
  //   render(<StaffHomePage />);
  //   await waitFor(() => {
  //     expect(screen.getByText('staff@example.com')).toBeInTheDocument();
  //   });
  // });

  it('redirects to login if no staff user in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    render(<StaffHomePage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/loginStaff');
    });
  });
});