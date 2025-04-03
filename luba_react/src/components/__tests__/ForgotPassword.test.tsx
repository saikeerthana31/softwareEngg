import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from 'components/ForgotPassword';
import { supabase } from 'utils/supabaseClient';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('ForgotPassword Component', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    require('next/navigation').useRouter.mockReturnValue(mockRouter);
  });

  it('renders without crashing', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
  });

  it('sends reset link successfully', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });

    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('Check your email for a password reset link.')).toBeInTheDocument();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
        redirectTo: expect.any(String),
      });
    });
  });

  it('shows error on reset failure', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: { message: 'Reset failed' } });

    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('Reset failed')).toBeInTheDocument();
    });
  });

  it('navigates back to sign in', () => {
    render(<ForgotPassword />);
    fireEvent.click(screen.getByText('Back to Sign In'));
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});