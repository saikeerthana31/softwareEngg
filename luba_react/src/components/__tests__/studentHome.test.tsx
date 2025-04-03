import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StudentHome from '../../components/studentHome';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'student-id' } }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  },
}));

jest.mock('react-calendar/dist/Calendar.css', () => {});

describe('StudentHome Component', () => {
  beforeEach(() => {
    localStorage.setItem('studentUser', JSON.stringify({ email: 'student@example.com' }));
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', async () => {
    render(<StudentHome />);
    await waitFor(() => {
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument(); // Adjust based on actual text
    });
  });

  it('displays student email in sidebar', async () => {
    render(<StudentHome />);
    await waitFor(() => {
      expect(screen.getByText('student@example.com')).toBeInTheDocument();
    });
  });

  it('loads and displays enrolled courses', async () => {
    const { supabase } = jest.requireMock('@/utils/supabaseClient');
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [{ course_name: 'Math 101' }], error: null })),
          })),
        })),
      })),
    });

    render(<StudentHome />);
    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument(); // Adjust based on actual data
    });
  });

  it('redirects to login if no student user in localStorage', async () => {
    const mockPush = jest.fn();
    (jest.requireMock('next/navigation').useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.clear();
    render(<StudentHome />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/loginStudent');
    });
  });
});