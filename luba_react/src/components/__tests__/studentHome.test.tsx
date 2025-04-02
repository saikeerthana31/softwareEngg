import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentHome from '../src/components/StudentHome';
import * as supabaseActions from '../src/actions/supabaseActions';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock supabaseActions
jest.mock('../src/actions/supabaseActions', () => ({
  fetchStudentData: jest.fn(() =>
    Promise.resolve({
      enrolledCourses: [{ id: '101', name: 'Math 101' }],
    })
  ),
  logoutUser: jest.fn(() => Promise.resolve()),
}));

describe('StudentHome Component', () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    localStorage.setItem('studentUser', JSON.stringify({ email: 'student@example.com' }));
    jest.clearAllMocks();
    require('next/navigation').useRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<StudentHome />);
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
  });

  it('displays student email in sidebar', () => {
    render(<StudentHome />);
    expect(screen.getByText('student@example.com')).toBeInTheDocument();
  });

  it('loads and displays enrolled courses', async () => {
    render(<StudentHome />);
    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument();
    });
  });

  it('logs out and redirects when logout button is clicked', () => {
    render(<StudentHome />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(localStorage.getItem('studentUser')).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith('/loginStudent');
  });

  it('redirects to login if no student user in localStorage', () => {
    localStorage.clear();
    render(<StudentHome />);
    expect(mockRouter.push).toHaveBeenCalledWith('/loginStudent');
  });
});