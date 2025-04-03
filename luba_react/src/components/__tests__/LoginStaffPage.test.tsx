import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffLogin from '../../components/LoginStaffPage';

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

describe('StaffLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<StaffLogin />);
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('displays error for invalid email', () => {
    render(<StaffLogin />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
  });

  it('shows error for non-staff role', async () => {
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

    render(<StaffLogin />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'student@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Access denied. Only staff members are allowed.')).toBeInTheDocument();
    });
  });
});