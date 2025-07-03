import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KiosksPanel from '../KiosksPanel.jsx';
import axios from 'axios';

jest.mock('axios');

const kiosks = [
  { id: 'abc', version: '1', last_seen: '2024-01-01T00:00:00Z', active: true }
];

beforeEach(() => {
  axios.get.mockReset();
  axios.put.mockReset();
  process.env.VITE_API_URL = 'http://api';
  axios.get.mockResolvedValue({ data: kiosks });
});

test('toggles kiosk active state', async () => {
  render(<KiosksPanel open={true} onClose={() => {}} />);
  const toggleBtn = await screen.findByRole('button', { name: /disable/i });
  await userEvent.click(toggleBtn);
  expect(axios.put).toHaveBeenCalledWith('http://api/api/kiosks/abc/active', { active: false });
  await screen.findByRole('button', { name: /activate/i });
});
