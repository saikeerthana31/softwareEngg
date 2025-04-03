import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminHome from '../../components/AdminHomePage';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('../../utils/supabaseClient', () => ({
  __esModule: true,
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'admin-id' } }, 
        error: null 
      })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

describe('AdminHome Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    localStorage.setItem('adminUser', JSON.stringify({ email: 'admin@example.com' }));
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue({ 
      push: mockPush 
    });
  });

  afterEach(() => {
    localStorage.clear();
    mockPush.mockClear();
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<AdminHome />);
    });
    expect(screen.getByText('Welcome, admin@example.com!')).toBeInTheDocument();
  });

  it('displays navigation links', async () => {
    await act(async () => {
      render(<AdminHome />);
    });
    
    // Use getAllByText and check for at least one instance
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Staff Management/i).length).toBeGreaterThan(0);
  });

  it('logs out and redirects when logout button is clicked', async () => {
    await act(async () => {
      render(<AdminHome />);
    });
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await act(async () => {
      fireEvent.click(logoutButton);
    });
    
    expect(localStorage.getItem('adminUser')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });

  it('redirects to login if no admin user in localStorage', async () => {
    localStorage.clear();
    await act(async () => {
      render(<AdminHome />);
    });
    expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
  });
});