jest.mock('@slack/bolt');
const { __commandRegistry } = require('@slack/bolt');
require('..');

describe('Slack command handler', () => {
  it('opens modal when /new-ticket is invoked', async () => {
    const handler = __commandRegistry['/new-ticket'];
    expect(typeof handler).toBe('function');
    const ack = jest.fn().mockResolvedValue();
    const open = jest.fn().mockResolvedValue();
    const client = { views: { open } };
    const body = { trigger_id: '123', user: { id: 'U1' } };

    await handler({ ack, body, client });

    expect(ack).toHaveBeenCalled();
    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger_id: '123',
        view: expect.objectContaining({ type: 'modal' }),
      })
    );
  });
});
