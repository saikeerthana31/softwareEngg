import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginAdmin from '../../components/LoginAdminPage';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('LoginAdmin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<LoginAdmin />);
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('displays error for invalid email', () => {
    render(<LoginAdmin />);
    const emailInput = screen.getByPlaceholderText(/email/i); // Fallback if label association is broken
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
  });

  it('logs in successfully as admin', async () => {
    const mockPush = jest.fn();
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'admin-id' } },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({
            data: { role: 'admin', pending_approval: false },
            error: null,
          })),
        })),
      })),
    });

    render(<LoginAdmin />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(localStorage.getItem('isAdminAuthenticated')).toBe('true');
      expect(mockPush).toHaveBeenCalledWith('/adminhome');
    });
  });

  it('shows error for non-admin role', async () => {
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'student-id' } },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({
            data: { role: 'student', pending_approval: false },
            error: null,
          })),
        })),
      })),
    });

    render(<LoginAdmin />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Access denied.')).toBeInTheDocument();
    });
  });
});