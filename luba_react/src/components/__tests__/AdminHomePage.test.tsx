import { render, screen, fireEvent } from '@testing-library/react';
import AdminHome from '../../components/AdminHomePage';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'admin-id' } }, error: null })),
    },
  },
}));

describe('AdminHome Component', () => {
  beforeEach(() => {
    localStorage.setItem('adminUser', JSON.stringify({ email: 'admin@example.com' }));
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<AdminHome />);
    expect(screen.getByText('Welcome, admin@example.com!')).toBeInTheDocument();
  });

  it('toggles sidebar when menu button is clicked', () => {
    render(<AdminHome />);
    const menuButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(menuButton);
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('displays navigation links', () => {
    render(<AdminHome />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Staff Management')).toBeInTheDocument();
  });

  it('logs out and redirects when logout button is clicked', () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    render(<AdminHome />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(localStorage.getItem('adminUser')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });

  it('redirects to login if no admin user in localStorage', () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.clear();
    render(<AdminHome />);
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });

  it('redirects to login if Supabase auth fails', async () => {
    const mockPush = jest.fn();
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null }, error: 'No user' });
    render(<AdminHome />);
    await new Promise((r) => setTimeout(r, 0)); // Wait for useEffect
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });
});