import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenerateReportButton from '../components/GenerateReportButton/GenerateReportButton';

jest.mock('../api/analyticsReportApi', () => ({
  generateAnalyticsReport: jest.fn(),
}));

const { generateAnalyticsReport } = require('../api/analyticsReportApi');

const MOCK_PAYLOAD = { viewMode: 'day', farm: { id: '1', name: 'Test Farm' } };

describe('GenerateReportButton', () => {
  let originalOpen;

  beforeEach(() => {
    jest.clearAllMocks();
    originalOpen = window.open;
    window.open = jest.fn(() => ({
      document: { write: jest.fn(), close: jest.fn() },
      focus: jest.fn(),
      print: jest.fn(),
    }));
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  test('renders the button with correct label', () => {
    render(<GenerateReportButton getPayload={() => MOCK_PAYLOAD} />);
    expect(screen.getByRole('button', { name: /Generate AI Report/i })).toBeInTheDocument();
  });

  test('shows loading state while generating', async () => {
    generateAnalyticsReport.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ report: '# Report' }), 100)),
    );

    render(<GenerateReportButton getPayload={() => MOCK_PAYLOAD} />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Generate AI Report/i }));
    });

    expect(screen.getByRole('button', { name: /Generating Report/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Generate AI Report/i })).not.toBeDisabled();
    });
  });

  test('opens print window on success', async () => {
    generateAnalyticsReport.mockResolvedValue({ report: '## Test Report\nContent here.' });

    render(<GenerateReportButton getPayload={() => MOCK_PAYLOAD} />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Generate AI Report/i }));
    });

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith('', '_blank');
    });
  });

  test('shows error snackbar on failure', async () => {
    generateAnalyticsReport.mockRejectedValue(new Error('API down'));

    render(<GenerateReportButton getPayload={() => MOCK_PAYLOAD} />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Generate AI Report/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('API down')).toBeInTheDocument();
    });
  });
});
