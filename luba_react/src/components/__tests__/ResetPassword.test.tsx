import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from 'components/ResetPassword';
import { supabase } from 'utils/supabaseClient';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

describe('ResetPassword Component', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    require('next/navigation').useRouter.mockReturnValue(mockRouter);
    Object.defineProperty(window, 'location', {
      value: { hash: '#access_token=valid-token' },
      writable: true,
    });
  });

  it('renders without crashing', () => {
    render(<ResetPassword />);
    expect(screen.getByText('Set New Password')).toBeInTheDocument();
  });

  it('updates password successfully', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

    render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPassword123!' } });
    fireEvent.click(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(screen.getByText('Password updated successfully! Redirecting to login...')).toBeInTheDocument();
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'NewPassword123!' });
    });
  });

  it('shows error for missing token', () => {
    Object.defineProperty(window, 'location', { value: { hash: '' }, writable: true });
    render(<ResetPassword />);
    expect(screen.getByText('Invalid or missing reset token.')).toBeInTheDocument();
  });

  it('shows error on update failure', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: { message: 'Update failed' } });

    render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPassword123!' } });
    fireEvent.click(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });
});