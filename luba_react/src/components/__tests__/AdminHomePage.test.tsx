import { render, screen, fireEvent } from '@testing-library/react';
import AdminHome from 'components/AdminHomePage';
import { supabase } from 'utils/supabaseClient';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase auth
jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'admin-id' } }, error: null })),
    },
  },
}));

describe('AdminHome Component', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    localStorage.setItem('adminUser', JSON.stringify({ email: 'admin@example.com' }));
    jest.clearAllMocks();
    require('next/navigation').useRouter.mockReturnValue(mockRouter);
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
    render(<AdminHome />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(localStorage.getItem('adminUser')).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith('/loginAdmin');
  });

  it('redirects to login if no admin user in localStorage', () => {
    localStorage.clear();
    render(<AdminHome />);
    expect(mockRouter.push).toHaveBeenCalledWith('/loginAdmin');
  });

  it('redirects to login if Supabase auth fails', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({ data: { user: null }, error: 'No user' });
    render(<AdminHome />);
    await new Promise((r) => setTimeout(r, 0)); // Wait for useEffect
    expect(mockRouter.push).toHaveBeenCalledWith('/loginAdmin');
  });
});