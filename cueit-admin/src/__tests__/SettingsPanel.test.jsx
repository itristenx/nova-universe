import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import SettingsPanel from '../SettingsPanel.jsx';

jest.mock('axios');

const kiosk = { id: 'k1', version: '1', last_seen: '2024-01-01T00:00:00Z', active: 0 };

describe('SettingsPanel', () => {
  test('calls axios to save config', async () => {
    const setConfig = jest.fn();
    const config = { logoUrl: 'a', faviconUrl: 'b', welcomeMessage: 'hi', helpMessage: 'help' };
    axios.put.mockResolvedValue({});
    render(<SettingsPanel open={true} onClose={() => {}} config={config} setConfig={setConfig} />);
    await userEvent.click(screen.getByText('Save'));
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/api/config'), config);
  });

  test('toggles kiosk active state', async () => {
    axios.get.mockResolvedValueOnce({ data: [kiosk] });
    axios.put.mockResolvedValue({});
    render(<SettingsPanel open={true} onClose={() => {}} config={{}} setConfig={() => {}} />);
    await userEvent.click(screen.getByText('Kiosks'));
    expect(await screen.findByText('k1')).toBeInTheDocument();
    const toggleBtn = screen.getByRole('button', { name: /activate/i });
    await userEvent.click(toggleBtn);
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/api/kiosks/k1/active'), { active: true });
  });
});
