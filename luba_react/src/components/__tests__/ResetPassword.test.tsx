import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPassword from '../../components/ResetPassword';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'location', { 
      value: { hash: '#access_token=abc123' }, 
      writable: true 
    });
  });

  it('renders without crashing', () => {
    render(<ResetPassword />);
    expect(screen.getByText('Set New Password')).toBeInTheDocument();
  });

  it('shows error for missing token', () => {
    Object.defineProperty(window, 'location', { value: { hash: '' }, writable: true });
    render(<ResetPassword />);
    expect(screen.getByText('Invalid or missing reset token.')).toBeInTheDocument();
  });

  it('shows error on update failure', async () => {
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ 
      error: { message: 'Update failed' } 
    });

    render(<ResetPassword />);
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'NewPassword123!' } 
    });
    fireEvent.click(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });
});