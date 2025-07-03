import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigPanel from '../ConfigPanel.jsx';

describe('ConfigPanel', () => {
  test('calls save when Save button is clicked', async () => {
    const save = jest.fn();
    const setConfig = jest.fn();
    const config = { logoUrl: 'a', faviconUrl: 'b', welcomeMessage: 'hi', helpMessage: 'help' };
    render(<ConfigPanel open={true} onClose={() => {}} config={config} setConfig={setConfig} save={save} />);
    await userEvent.click(screen.getByText('Save'));
    expect(save).toHaveBeenCalled();
  });
});
