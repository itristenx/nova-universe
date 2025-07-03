import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';
import axios from 'axios';

jest.mock('axios');

const logs = [
  { ticket_id: '1', name: 'Charlie', email: 'c@example.com', title: 't1', system: 'mac', urgency: 'Low', email_status: 'success', timestamp: '2024-01-02T10:00:00Z' },
  { ticket_id: '2', name: 'Alice', email: 'a@example.com', title: 't2', system: 'win', urgency: 'High', email_status: 'success', timestamp: '2024-01-01T12:00:00Z' },
  { ticket_id: '3', name: 'Bob', email: 'b@example.com', title: 't3', system: 'mac', urgency: 'Urgent', email_status: 'failed', timestamp: '2024-01-03T09:00:00Z' }
];

beforeEach(() => {
  axios.get.mockReset();
  axios.put.mockReset();
  process.env.VITE_API_URL = 'http://api';
  process.env.VITE_LOGO_URL = 'logo.png';
  axios.get.mockImplementation((url) => {
    if (url.endsWith('/logs')) return Promise.resolve({ data: logs });
    if (url.endsWith('/config')) return Promise.resolve({ data: {} });
    return Promise.resolve({ data: [] });
  });
});

test('filters and sorts logs via user input', async () => {
  render(<App />);
  // wait for logs to appear
  await screen.findByText('Alice');

  const [urgencySelect, systemSelect, sortSelect] = screen.getAllByRole('combobox');

  // filter by urgency
  await userEvent.selectOptions(urgencySelect, 'High');
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.queryByText('Bob')).not.toBeInTheDocument();

  // remove urgency filter for search
  await userEvent.selectOptions(urgencySelect, '');

  // search
  await userEvent.click(screen.getByRole('button', { name: /toggle search/i }));
  const searchInput = screen.getByPlaceholderText('Search...');
  await userEvent.type(searchInput, 'bob');
  expect(screen.getByText('Bob')).toBeInTheDocument();
  expect(screen.queryByText('Alice')).not.toBeInTheDocument();

  // sort by name
  await userEvent.clear(searchInput);
  await userEvent.selectOptions(sortSelect, 'name');
  const table = screen.getAllByRole('table')[0];
  const rows = within(table).getAllByRole('row').slice(1);
  const names = rows.map((r) => within(r).getAllByRole('cell')[1].textContent);
  expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
});
