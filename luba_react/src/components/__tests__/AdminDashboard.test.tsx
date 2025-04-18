import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../../components/AdminDashboard';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'admin-id' } }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: [{ lab_id: 'new-lab' }], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div>Mocked Bar Chart</div>,
  Line: () => <div>Mocked Line Chart</div>,
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('adminUser', JSON.stringify({ email: 'admin@example.com' }));
    jest.clearAllMocks();
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'labs') {
        return {
          select: jest.fn(() =>
            Promise.resolve({
              data: [{ lab_id: '1', lab_name: 'Lab 1', location: 'Room 101', capacity: 10, equipment: [] }],
              error: null,
            })
          ),
        };
      }
      if (table === 'lab_bookings') {
        return {
          select: jest.fn(() =>
            Promise.resolve({
              data: [{ booking_id: 'b1', lab_id: '1', status: 'pending', users: { name: 'User' }, date: '2025-04-03' }],
              error: null,
            })
          ),
        };
      }
      return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', async () => {
    render(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Labs Overview')).toBeInTheDocument();
    });
  });

  it('displays labs', async () => {
    render(<AdminDashboard />);
    await waitFor(() => {
      const labElements = screen.getAllByText('Lab 1');
      expect(labElements[0]).toBeInTheDocument();
    });
  });

  it('approves a booking', async () => {
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    render(<AdminDashboard />);
    await waitFor(() => {
      const approveButton = screen.getAllByText('✅')[0];
      fireEvent.click(approveButton);
      expect(supabase.from).toHaveBeenCalledWith('lab_bookings');
    });
  });

  it('logs out and redirects', async () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    render(<AdminDashboard />);
    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
      expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
    });
  });
});