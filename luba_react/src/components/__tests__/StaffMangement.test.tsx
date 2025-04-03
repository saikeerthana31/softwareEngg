import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StaffManagement from '../StaffMangement';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/actions/supabaseActions', () => ({
  fetchUsers: jest.fn(() =>
    Promise.resolve({
      pendingUsers: [{ user_id: '1', email: 'pending@example.com', name: 'Pending User', pending_approval: true }],
      allUsers: [{ user_id: '2', email: 'user@example.com', name: 'User', role: 'staff' }],
    })
  ),
  approveUser: jest.fn(() => Promise.resolve()),
  rejectUser: jest.fn(() => Promise.resolve()),
  deleteUser: jest.fn(() => Promise.resolve()),
}));

describe('StaffManagement Component', () => {
  beforeEach(() => {
    localStorage.setItem('adminUser', JSON.stringify({ email: 'admin@example.com', role: 'admin' }));
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<StaffManagement />);
    expect(screen.getByText('Staff Management')).toBeInTheDocument();
  });

  it('displays admin email in sidebar', () => {
    render(<StaffManagement />);
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('toggles sidebar when menu button is clicked', () => {
    render(<StaffManagement />);
    const menuButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(menuButton);
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('loads and displays pending users', async () => {
    render(<StaffManagement />);
    await waitFor(() => {
      expect(screen.getByText('pending@example.com')).toBeInTheDocument();
    });
  });

  it('approves a pending user', async () => {
    const { approveUser } = jest.requireMock('@/actions/supabaseActions');
    render(<StaffManagement />);
    await waitFor(() => {
      const approveButton = screen.getAllByText('Approve')[0];
      fireEvent.click(approveButton);
      expect(approveUser).toHaveBeenCalledWith('1');
    });
  });

  it('rejects a pending user', async () => {
    const { rejectUser } = jest.requireMock('@/actions/supabaseActions');
    render(<StaffManagement />);
    await waitFor(() => {
      const rejectButton = screen.getAllByText('Reject')[0];
      fireEvent.click(rejectButton);
      expect(rejectUser).toHaveBeenCalledWith('1');
    });
  });

  it('deletes a user', async () => {
    const { deleteUser } = jest.requireMock('@/actions/supabaseActions');
    render(<StaffManagement />);
    await waitFor(() => {
      const deleteButton = screen.getAllByRole('button', { name: /trash/i })[0];
      fireEvent.click(deleteButton);
      expect(deleteUser).toHaveBeenCalledWith('2');
    });
  });

  it('logs out and redirects when logout button is clicked', () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    render(<StaffManagement />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(localStorage.getItem('adminUser')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });

  it('redirects to login if no admin user in localStorage', () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.clear();
    render(<StaffManagement />);
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });
});