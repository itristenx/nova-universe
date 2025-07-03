import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import KiosksPanel from '../KiosksPanel.jsx';

jest.mock('axios');

const kiosk = { id: 'k1', version: '1', last_seen: '2024-01-01T00:00:00Z', active: 0 };

describe('KiosksPanel', () => {
  test('toggles kiosk active state', async () => {
    axios.get.mockResolvedValueOnce({ data: [kiosk] });
    axios.put.mockResolvedValue({});
    render(<KiosksPanel open={true} onClose={() => {}} />);
    expect(await screen.findByText('k1')).toBeInTheDocument();
    const toggleBtn = screen.getByRole('button', { name: /activate/i });
    await userEvent.click(toggleBtn);
    expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/api/kiosks/k1/active'), { active: true });
    expect(toggleBtn.textContent.toLowerCase()).toContain('disable');
  });
});
