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

  it('displays error for invalid email', async () => {
    render(<LoginAdmin />);
    const emailInput = screen.getByRole('textbox');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByText('Sign in'));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
    });
  });

});