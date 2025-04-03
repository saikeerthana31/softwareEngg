import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StaffHomePage from '../../components/staffHomePage';
import * as supabaseActions from '../../actions/supabaseActions';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock supabaseActions
jest.mock('../src/actions/supabaseActions', () => ({
  fetchStaffHomeData: jest.fn(() =>
    Promise.resolve({
      announcements: [{ id: '303', title: 'Meeting at 3 PM' }],
    })
  ),
  postAnnouncement: jest.fn(() => Promise.resolve()),
}));

describe('StaffHomePage Component', () => {
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
    render(<StaffHomePage />);
    expect(screen.getByText('Staff Home')).toBeInTheDocument();
  });

  it('displays staff email in sidebar', () => {
    render(<StaffHomePage />);
    expect(screen.getByText('staff@example.com')).toBeInTheDocument();
  });

  it('loads and displays announcements', async () => {
    render(<StaffHomePage />);
    await waitFor(() => {
      expect(screen.getByText('Meeting at 3 PM')).toBeInTheDocument();
    });
  });

  it('posts a new announcement', async () => {
    render(<StaffHomePage />);
    const input = screen.getByPlaceholderText('Enter announcement...');
    fireEvent.change(input, { target: { value: 'New Announcement' } });

    const postButton = screen.getByText('Post');
    fireEvent.click(postButton);

    await waitFor(() => {
      expect(supabaseActions.postAnnouncement).toHaveBeenCalledWith('New Announcement');
    });
  });

  it('redirects to login if no staff user in localStorage', () => {
    localStorage.clear();
    render(<StaffHomePage />);
    expect(mockRouter.push).toHaveBeenCalledWith('/loginStaff');
  });
});