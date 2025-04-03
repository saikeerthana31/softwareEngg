import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPassword from '../../components/ForgotPassword';
import { supabase } from '../../utils/supabaseClient';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock supabase client
jest.mock('@/utils/supabaseClient', () => ({
  __esModule: true,
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
    },
  },
}));

describe('ForgotPassword Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (require('next/navigation').useRouter as jest.Mock).mockReturnValue({ 
      push: mockPush 
    });
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
  });

  it('sends reset link successfully with correct redirect URL', async () => {
    render(<ForgotPassword />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByText('Send Reset Link');
    
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('resetPassword') // Updated to match actual URL
        })
      );
    });
    
    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText('Check your email for a password reset link.')).toBeInTheDocument();
    });
  });

  it('shows error message when reset fails', async () => {
    // Mock a failed response
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      error: new Error('Reset failed')
    });
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByText('Send Reset Link');
    
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);
    
    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Reset failed')).toBeInTheDocument(); // Updated to match actual error message
    });
  });
});