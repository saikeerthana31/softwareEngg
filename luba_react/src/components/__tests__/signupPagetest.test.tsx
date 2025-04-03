import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Signup from '../../components/signupPagetest';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Signup />);
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
  });

  it('displays error for invalid email', () => {
    render(<Signup />);
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } }); // Fill name
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument(); // Adjust text if needed
  });

  it('signs up successfully', async () => {
    const mockPush = jest.fn();
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'new-user-id' } },
      error: null,
    });

    render(<Signup />);
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'student' } });
    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockPush).toHaveBeenCalledWith('/loginStaff');
    });
  });

  it('shows error for empty name', () => {
    render(<Signup />);
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
  });
});