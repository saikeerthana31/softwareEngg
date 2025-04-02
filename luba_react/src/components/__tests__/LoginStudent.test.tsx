import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentLogin from 'components/LoginStudent';
import { supabase } from 'utils/supabaseClient';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../utils/supabaseClient', () => ({
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
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    require('next/navigation').useRouter.mockReturnValue(mockRouter);
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
      expect(mockRouter.push).toHaveBeenCalledWith('/studentHome');
    });
  });

  it('shows error for non-student role', async () => {
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