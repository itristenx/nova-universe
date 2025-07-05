import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import SettingsPanel from '../SettingsPanel.jsx';

jest.mock('axios');

const status = {
  id: 'k1',
  statusEnabled: 0,
  currentStatus: 'open',
  openMsg: 'Hi',
  closedMsg: 'Bye',
  errorMsg: 'Err',
  schedule: '{}',
};

test('saves status via axios', async () => {
  axios.get.mockResolvedValueOnce({ data: [status] });
  axios.put.mockResolvedValue({});
  render(<SettingsPanel open={true} onClose={() => {}} config={{}} setConfig={() => {}} />);
  await userEvent.click(screen.getByText('Status'));
  const input = await screen.findByLabelText('Open Message');
  await userEvent.clear(input);
  await userEvent.type(input, 'Hello');
  await userEvent.click(screen.getByText('Save'));
  expect(axios.put).toHaveBeenCalledWith(
    expect.stringContaining('/api/kiosks/k1/status'),
    expect.objectContaining({ openMsg: 'Hello' })
  );
});
