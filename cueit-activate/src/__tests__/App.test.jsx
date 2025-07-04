import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App.jsx';

jest.mock('axios');

beforeEach(() => {
  process.env.VITE_API_URL = 'http://localhost';
  delete process.env.VITE_ADMIN_URL;
  axios.put.mockReset();
});

test('activates kiosk and shows success message', async () => {
  axios.put.mockResolvedValue({});
  render(<App />);
  await userEvent.type(screen.getByPlaceholderText('Enter kiosk ID'), '42');
  await userEvent.click(screen.getByText('Activate'));
  expect(axios.put).toHaveBeenCalledWith('http://localhost/api/kiosks/42/active', { active: true });
  expect(await screen.findByText('Kiosk activated')).toBeInTheDocument();
});

test('shows error message when activation fails', async () => {
  axios.put.mockRejectedValue(new Error('fail'));
  render(<App />);
  await userEvent.type(screen.getByPlaceholderText('Enter kiosk ID'), '99');
  await userEvent.click(screen.getByText('Activate'));
  expect(await screen.findByText('Activation failed')).toBeInTheDocument();
});

test('renders admin link when env var is set', () => {
  process.env.VITE_ADMIN_URL = 'http://admin';
  render(<App />);
  const link = screen.getByText('Go to Admin UI');
  expect(link).toHaveAttribute('href', 'http://admin');
});
