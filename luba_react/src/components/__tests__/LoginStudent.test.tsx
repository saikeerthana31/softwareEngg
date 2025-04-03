import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentLogin from '../../components/LoginStudent';

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

describe('StudentLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<StudentLogin />);
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('displays error for invalid email', () => {
    render(<StudentLogin />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
  });

  it('logs in successfully as student', async () => {
    const mockPush = jest.fn();
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
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

    render(<StudentLogin />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(localStorage.getItem('isStudentAuthenticated')).toBe('true');
      expect(mockPush).toHaveBeenCalledWith('/studentHome');
    });
  });

  it('shows error for non-student role', async () => {
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'faculty-id' } },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({
            data: { role: 'faculty', pending_approval: false },
            error: null,
          })),
        })),
      })),
    });

    render(<StudentLogin />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'faculty@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Access denied. Only students are allowed.')).toBeInTheDocument();
    });
  });
});