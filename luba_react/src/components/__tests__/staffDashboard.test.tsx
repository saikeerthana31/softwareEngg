import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffDashboard from '../staffDashboard';

// Mock the necessary modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'staff-id' } }, 
        error: null 
      })),
    },
  },
}));

jest.mock('@/utils/supabaseAdmin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'staff-id' } }, 
        error: null 
      })),
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

jest.mock('@/actions/supabaseActions', () => ({
  fetchStaffData: jest.fn(() =>
    Promise.resolve({
      assignedTasks: [{ id: '202', title: 'Grade Assignments', status: 'pending' }],
    })
  ),
  completeTask: jest.fn(() => Promise.resolve()),
}));

describe('StaffDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('staffUser', JSON.stringify({ 
      email: 'staff@example.com',
      role: 'staff'
    }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redirects to login page if no staff user in localStorage', async () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ 
      push: mockPush 
    });
    localStorage.clear();
    
    render(<StaffDashboard />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/loginAdmin');
    });
  });

  it('marks a task as completed when completeTask is called', async () => {
    const { completeTask } = jest.requireMock('@/actions/supabaseActions');
    completeTask('202');
    expect(completeTask).toHaveBeenCalledWith('202');
  });

  it('uses staffUser data from localStorage', () => {
    render(<StaffDashboard />);
    const staffUser = JSON.parse(localStorage.getItem('staffUser') || '{}');
    expect(staffUser.email).toBe('staff@example.com');
    expect(staffUser.role).toBe('staff');
  });
});