import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App.jsx';

jest.mock('axios');

const logs = [
  { ticket_id: '1', name: 'Alice', email: 'a@x.com', title: 'A', system: 'Sys1', urgency: 'High', email_status: 'success', timestamp: '2024-05-01T10:00:00Z' },
  { ticket_id: '2', name: 'Bob', email: 'b@x.com', title: 'B', system: 'Sys2', urgency: 'Low', email_status: 'success', timestamp: '2024-05-02T10:00:00Z' }
];

beforeEach(() => {
  process.env.VITE_API_URL = 'http://localhost';
  axios.get.mockImplementation((url) => {
    if (url.endsWith('/api/logs')) return Promise.resolve({ data: logs });
    if (url.endsWith('/api/config')) return Promise.resolve({ data: {} });
    if (url.endsWith('/api/me')) return Promise.resolve({ data: { name: 'Admin' } });
  });
  axios.put.mockResolvedValue({});
});

describe('App filtering and config', () => {
  test('filters logs by search and sorts by name', async () => {
    render(<App />);
    await screen.findByText('Alice');
    const searchBtn = screen.getByLabelText('Toggle Search');
    await userEvent.click(searchBtn);
    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'Bob');
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Alice')).toBeNull();
    const clearBtn = within(searchInput.parentElement).getByLabelText('Clear search');
    await userEvent.click(clearBtn);
    expect(searchInput).toHaveValue('');
    await userEvent.selectOptions(screen.getByDisplayValue('Sort by Date'), 'name');
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Alice')).toBeInTheDocument();
  });

  test('saves config via axios and updates logo url', async () => {
    render(<App />);
    await screen.findByText('Alice');
    await userEvent.click(screen.getByLabelText('Settings'));
    await userEvent.click(screen.getByText('Settings'));
    const logoInput = screen.getByLabelText('Logo URL');
    await userEvent.clear(logoInput);
    await userEvent.type(logoInput, 'newlogo.png');
    window.alert = jest.fn();
    await userEvent.click(screen.getByText('Save'));
    expect(axios.put).toHaveBeenCalledWith('http://localhost/api/config', expect.objectContaining({ logoUrl: 'newlogo.png' }));
    expect(screen.getByAltText('Logo').src).toContain('newlogo.png');
  });
});
