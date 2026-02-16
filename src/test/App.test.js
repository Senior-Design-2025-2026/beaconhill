import { render, screen } from '@testing-library/react';
import App from '../App';

// App.test expects test mode content; run with: npm run test:ci or REACT_APP_MODE=test npm test
test('renders welcome text when in test mode', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/welcome/i);
  expect(welcomeElement).toBeInTheDocument();
});
