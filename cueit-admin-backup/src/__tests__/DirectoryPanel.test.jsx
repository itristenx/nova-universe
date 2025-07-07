import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import DirectoryPanel from '../DirectoryPanel.jsx';

jest.mock('axios');

test('saves and tests directory config', async () => {
  axios.get.mockResolvedValueOnce({ data: { directoryProvider: 'mock', directoryUrl: '', directoryToken: '' } });
  axios.put.mockResolvedValue({});
  axios.get.mockResolvedValue({ data: [] });
  render(<DirectoryPanel />);
  await screen.findByText('Provider');
  const urlInput = screen.getByLabelText('URL');
  await userEvent.type(urlInput, 'http://x');
  await userEvent.click(screen.getByText('Save'));
  expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/api/directory-config'), expect.objectContaining({ directoryUrl: 'http://x' }));
  await userEvent.click(screen.getByText('Test'));
  expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/directory-search'), { params: { q: 'test' } });
});
