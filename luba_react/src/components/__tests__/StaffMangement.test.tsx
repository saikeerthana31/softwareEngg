// src/components/__tests__/StaffManagement.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import StaffMangement from '../StaffMangement';
import * as supabaseActions from '@/actions/supabaseActions';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/actions/supabaseActions', () => ({
  fetchUsers: jest.fn(() =>
    Promise.resolve({
      pendingUsers: [{ user_id: '1', email: 'pending@example.com', name: 'Pending User' }],
      allUsers: [{ user_id: '2', email: 'user@example.com', name: 'User', role: 'staff' }],
    })
  ),
  approveUser: jest.fn(() => Promise.resolve()),
  rejectUser: jest.fn(() => Promise.resolve()),
  deleteUser: jest.fn(() => Promise.resolve()),
}));

describe('StaffManagement', () => {
  beforeEach(() => {
    localStorage.setItem('adminUser', JSON.stringify({ email: 'admin@example.com', role: 'admin' }));
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<StaffMangement />);
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Staff Management/i })).toBeInTheDocument();
    });
  });

  it('loads and displays pending users', async () => {
    await act(async () => {
      render(<StaffMangement />);
    });

    await waitFor(() => {
      expect(screen.getByText('pending@example.com')).toBeInTheDocument();
      expect(screen.getByText('Pending User')).toBeInTheDocument();
      expect(supabaseActions.fetchUsers).toHaveBeenCalledTimes(1);
    });
  });

  it('toggles sidebar when menu button is clicked', async () => {
    await act(async () => {
      render(<StaffMangement />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Staff Management/i })).toBeInTheDocument();
    });

    const menuButton = screen.getByRole('button', { name: /Close menu/i });
    const sidebar = screen.getByRole('complementary');
    const adminPanelHeading = screen.getByText('Admin Panel');

    expect(sidebar).toHaveClass('w-64');
    expect(adminPanelHeading).toHaveClass('block');

    await act(async () => {
      fireEvent.click(menuButton);
    });

    expect(sidebar).toHaveClass('w-16');
    expect(adminPanelHeading).toHaveClass('hidden');
  });

  it('deletes a user', async () => {
    await act(async () => {
      render(<StaffMangement />);
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete user/i });
    expect(deleteButtons).toHaveLength(1);

    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(supabaseActions.deleteUser).toHaveBeenCalledWith('2');
      expect(supabaseActions.fetchUsers).toHaveBeenCalledTimes(2);
    });
  });

  it('redirects to login if no admin user is found', async () => {
    localStorage.clear();
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    await act(async () => {
      render(<StaffMangement />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
    });
  });
});