import { render, screen } from '@testing-library/react';
import axios from 'axios';
import FeedbackPanel from '../FeedbackPanel.jsx';

jest.mock('axios');

test('loads feedback when open', async () => {
  const items = [{ id: 1, name: 'Bob', message: 'Hi', timestamp: '2024-01-01T00:00:00Z' }];
  axios.get.mockResolvedValueOnce({ data: items });
  render(<FeedbackPanel open={true} />);
  expect(await screen.findByText('Hi')).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/feedback'));
});
