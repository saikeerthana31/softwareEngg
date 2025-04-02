import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StaffDashboard from '../staffDashboard';
import * as supabaseActions from '../../actions/supabaseActions';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock supabaseActions
jest.mock('../../actions/supabaseActions', () => ({
  fetchStaffData: jest.fn(() =>
    Promise.resolve({
      assignedTasks: [{ id: '202', title: 'Grade Assignments' }],
    })
  ),
  completeTask: jest.fn(() => Promise.resolve()),
}));

describe('StaffDashboard Component', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    localStorage.setItem('staffUser', JSON.stringify({ email: 'staff@example.com' }));
    jest.clearAllMocks();
    require('next/navigation').useRouter.mockReturnValue(mockRouter);
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
    render(<StaffDashboard />);
    await waitFor(() => {
      const completeButton = screen.getByText('Complete');
      fireEvent.click(completeButton);
      expect(supabaseActions.completeTask).toHaveBeenCalledWith('202');
    });
  });

  it('redirects to login if no staff user in localStorage', () => {
    localStorage.clear();
    render(<StaffDashboard />);
    expect(mockRouter.push).toHaveBeenCalledWith('/loginStaff');
  });
});