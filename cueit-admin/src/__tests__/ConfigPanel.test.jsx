import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigPanel from '../ConfigPanel.jsx';
import axios from 'axios';
import React, { useState } from 'react';

jest.mock('axios');

function Wrapper() {
  const [config, setConfig] = useState({ logoUrl: 'start.png' });
  const save = async () => {
    await axios.put('http://api/api/config', config);
  };
  return (
    <>
      <img data-testid="logo" src={config.logoUrl} alt="logo" />
      <ConfigPanel open={true} onClose={() => {}} config={config} setConfig={setConfig} save={save} />
    </>
  );
}

test('updates config and calls axios', async () => {
  process.env.VITE_API_URL = 'http://api';
  render(<Wrapper />);
  const input = screen.getByLabelText(/logo url/i);
  await userEvent.clear(input);
  await userEvent.type(input, 'newlogo.png');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));
  expect(axios.put).toHaveBeenCalledWith('http://api/api/config', expect.objectContaining({ logoUrl: 'newlogo.png' }));
  expect(screen.getByTestId('logo')).toHaveAttribute('src', 'newlogo.png');
});
