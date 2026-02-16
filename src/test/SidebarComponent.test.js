import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import SidebarComponent from '../components/SidebarComponent/SidebarComponent';

const MOCK_USER = {
  username: 'test-user',
  signInDetails: { loginId: 'test@example.com' },
};

// Run with npm run test:ci (REACT_APP_MODE=test) so AuthenticatedApp with sidebar is rendered.
describe('Sidebar in App (test mode)', () => {
  test('sidebar is visible with Beacon branding when expanded', () => {
    render(<App />);
    expect(screen.getByText(/Beacon/i)).toBeInTheDocument();
    expect(screen.getByText(/Hill/i)).toBeInTheDocument();
  });

  test('all four nav links are present', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /Live Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Configuration/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
  });

  test('user and profile area are present', () => {
    render(<App />);
    expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/My Farm/i)).toBeInTheDocument();
  });

  test('expand/collapse toggles sidebar content', async () => {
    render(
      <MemoryRouter>
        <SidebarComponent user={MOCK_USER} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Beacon/i)).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /Collapse sidebar/i });
    await userEvent.click(toggle);
    expect(screen.queryByText(/Beacon/i)).not.toBeInTheDocument();
    const expandBtn = screen.getByRole('button', { name: /Expand sidebar/i });
    await userEvent.click(expandBtn);
    expect(screen.getByText(/Beacon/i)).toBeInTheDocument();
  });

  test('navigating to Analytics shows Analytics page', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: /Analytics/i }));
    expect(screen.getByRole('heading', { name: /Analytics/i })).toBeInTheDocument();
  });

  test('navigating to Configuration shows Configuration page', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: /Configuration/i }));
    expect(screen.getByRole('heading', { name: /Configuration/i })).toBeInTheDocument();
  });

  test('navigating to Settings shows Settings page', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: /Settings/i }));
    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument();
  });

  test('navigating to Live Dashboard shows Live Dashboard page', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('link', { name: /Live Dashboard/i }));
    expect(screen.getByRole('heading', { name: /Live Dashboard/i })).toBeInTheDocument();
  });
});
