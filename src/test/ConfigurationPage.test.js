import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Run with: npm run test:ci (REACT_APP_MODE=test)

async function navigateToConfiguration() {
  render(<App />);
  await act(async () => {
    await userEvent.click(screen.getByRole('link', { name: /Configuration/i }));
  });
}

describe('ConfigurationPage', () => {
  test('renders Farms and Nodes section headings with counts', async () => {
    await navigateToConfiguration();
    expect(screen.getByText(/Farms: 3/)).toBeInTheDocument();
    expect(screen.getByText(/Nodes: 9/)).toBeInTheDocument();
  });

  test('tables render the correct number of data rows', async () => {
    await navigateToConfiguration();
    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(2);

    const farmRows = within(tables[0]).getAllByRole('row');
    // 1 header + 3 data rows
    expect(farmRows).toHaveLength(4);

    const nodeRows = within(tables[1]).getAllByRole('row');
    // 1 header + 9 data rows
    expect(nodeRows).toHaveLength(10);
  });

  test('tables are locked by default (no text inputs visible)', async () => {
    await navigateToConfiguration();
    const tables = screen.getAllByRole('table');
    const farmInputs = within(tables[0]).queryAllByRole('textbox');
    expect(farmInputs).toHaveLength(0);
  });

  test('clicking Edit unlocks the Farms table and shows editable fields', async () => {
    await navigateToConfiguration();
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    await act(async () => {
      await userEvent.click(editButtons[0]);
    });

    const tables = screen.getAllByRole('table');
    const farmInputs = within(tables[0]).getAllByRole('textbox');
    expect(farmInputs.length).toBeGreaterThan(0);
  });

  test('Add button is disabled when table is locked', async () => {
    await navigateToConfiguration();
    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    expect(addButtons[0]).toBeDisabled();
  });

  test('unlocking then adding a farm increases row count', async () => {
    await navigateToConfiguration();
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    await act(async () => {
      await userEvent.click(editButtons[0]);
    });

    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    await act(async () => {
      await userEvent.click(addButtons[0]);
    });

    expect(screen.getByText(/Farms: 4/)).toBeInTheDocument();
  });

  test('unlocking then deleting a farm decreases row count', async () => {
    await navigateToConfiguration();
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    await act(async () => {
      await userEvent.click(editButtons[0]);
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    await act(async () => {
      await userEvent.click(deleteButtons[0]);
    });

    expect(screen.getByText(/Farms: 2/)).toBeInTheDocument();
  });

  test('unlocking then adding a node increases row count', async () => {
    await navigateToConfiguration();
    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    // Second edit button is for Nodes section
    await act(async () => {
      await userEvent.click(editButtons[1]);
    });

    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    await act(async () => {
      await userEvent.click(addButtons[1]);
    });

    expect(screen.getByText(/Nodes: 10/)).toBeInTheDocument();
  });
});
