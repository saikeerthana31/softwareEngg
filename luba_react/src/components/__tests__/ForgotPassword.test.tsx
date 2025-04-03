import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPassword from '../../components/ForgotPassword';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
  });

  it('sends reset link successfully', async () => {
    const mockPush = jest.fn();
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });

    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error on reset failure', async () => {
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: { message: 'Reset failed' } });

    render(<ForgotPassword />);
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => {
      expect(screen.getByText('Reset failed')).toBeInTheDocument();
    });
  });
});