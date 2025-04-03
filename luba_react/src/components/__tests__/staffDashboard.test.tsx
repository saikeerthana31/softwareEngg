import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffDashboard from '../staffDashboard';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'staff-id' } }, error: null })),
    },
  },
}));

jest.mock('@/utils/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'staff-id' } }, error: null })),
    },
  },
}));

jest.mock('@/actions/supabaseActions', () => ({
  fetchStaffData: jest.fn(() =>
    Promise.resolve({
      assignedTasks: [{ id: '202', title: 'Grade Assignments' }],
    })
  ),
  completeTask: jest.fn(() => Promise.resolve()),
}));

describe('StaffDashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('staffUser', JSON.stringify({ email: 'staff@example.com' }));
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<StaffDashboard />);
    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
  });

  it('displays staff email in sidebar', () => {
    render(<StaffDashboard />);
    expect(screen.getByText('staff@example.com')).toBeInTheDocument();
  });

  it('loads and displays assigned tasks', async () => {
    render(<StaffDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Grade Assignments')).toBeInTheDocument();
    });
  });

  it('marks a task as completed', async () => {
    const { completeTask } = jest.requireMock('@/actions/supabaseActions');
    render(<StaffDashboard />);
    await waitFor(() => {
      const completeButton = screen.getByText('Complete');
      fireEvent.click(completeButton);
      expect(completeTask).toHaveBeenCalledWith('202');
    });
  });

  it('redirects to login if no staff user in localStorage', () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.clear();
    render(<StaffDashboard />);
    expect(mockPush).toHaveBeenCalledWith('/loginStaff');
  });
});