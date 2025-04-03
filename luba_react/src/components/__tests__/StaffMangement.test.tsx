// src/components/__tests__/StaffMangement.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StaffManagement from '../StaffMangement';

// Mock next/navigation
jest.mock('next/navigation', () => {
  const originalModule = jest.requireActual('next/navigation');
  return {
    ...originalModule,
    useRouter: () => ({
      push: jest.fn(),
    }),
  };
});

// Mock supabaseAdmin
jest.mock('@/utils/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  },
}));

// Mock supabaseActions
const mockFetchUsers = jest.fn(() =>
  Promise.resolve({
    pendingUsers: [{ user_id: '1', email: 'pending@example.com', name: 'Pending User', pending_approval: true }],
    allUsers: [{ user_id: '2', email: 'user@example.com', name: 'User', role: 'staff' }],
  })
);

const mockApproveUser = jest.fn(() => Promise.resolve());
const mockRejectUser = jest.fn(() => Promise.resolve());
const mockDeleteUser = jest.fn(() => Promise.resolve());

jest.mock('@/actions/supabaseActions', () => ({
  __esModule: true,
  fetchUsers: mockFetchUsers,
  approveUser: mockApproveUser,
  rejectUser: mockRejectUser,
  deleteUser: mockDeleteUser,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('StaffManagement Component', () => {
  beforeEach(() => {
    // Reset all mocks and set up localStorage
    jest.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'adminUser') {
        return JSON.stringify({ email: 'admin@example.com', role: 'admin' });
      }
      return null;
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });
    
    expect(screen.getByText('Staff Management')).toBeInTheDocument();
  });

  it('displays admin email in sidebar', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
  });

  it('toggles sidebar when menu button is clicked', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });
    
    const menuButton = await screen.findByRole('button', { name: /close/i });
    await act(async () => {
      fireEvent.click(menuButton);
    });
    
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('loads and displays pending users', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('pending@example.com')).toBeInTheDocument();
      expect(screen.getByText('Pending User')).toBeInTheDocument();
    });
  });

  it('approves a pending user', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });
    
    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
    });
    
    const approveButtons = await screen.findAllByText('Approve');
    await act(async () => {
      fireEvent.click(approveButtons[0]);
    });
    
    expect(mockApproveUser).toHaveBeenCalledWith('1');
  });

  it('rejects a pending user', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });
    
    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
    });
    
    const rejectButtons = await screen.findAllByText('Reject');
    await act(async () => {
      fireEvent.click(rejectButtons[0]);
    });
    
    expect(mockRejectUser).toHaveBeenCalledWith('1');
  });

  it('deletes a user', async () => {
    await act(async () => {
      render(<StaffManagement />);
    });
    
    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalled();
    });
    
    const deleteButtons = await screen.findAllByRole('button', { name: /trash/i });
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });
    
    expect(mockDeleteUser).toHaveBeenCalledWith('2');
  });

  it('logs out and redirects when logout button is clicked', async () => {
    const mockPush = jest.fn();
    require('next/navigation').useRouter.mockImplementation(() => ({
      push: mockPush,
    }));
    
    await act(async () => {
      render(<StaffManagement />);
    });
    
    const logoutButton = await screen.findByRole('button', { name: /logout/i });
    await act(async () => {
      fireEvent.click(logoutButton);
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('adminUser');
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });

  it('redirects to login if no admin user in localStorage', async () => {
    const mockPush = jest.fn();
    require('next/navigation').useRouter.mockImplementation(() => ({
      push: mockPush,
    }));
    
    // Simulate no admin user
    localStorageMock.getItem.mockImplementation(() => null);
    
    await act(async () => {
      render(<StaffManagement />);
    });
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
    });
  });
});