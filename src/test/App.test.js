import { render, screen } from '@testing-library/react';
import App from '../App';

// App.test expects test mode content; run with: npm run test:ci or REACT_APP_MODE=test npm test
test('renders sidebar with Beacon branding when in test mode', () => {
  render(<App />);
  const beaconElement = screen.getByText(/Beacon/i);
  expect(beaconElement).toBeInTheDocument();
});
