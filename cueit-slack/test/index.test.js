import { jest } from '@jest/globals';

jest.unstable_mockModule('@slack/bolt', () => {
  const commandRegistry = {};
  const startMock = jest.fn().mockResolvedValue();

  class App {
    constructor() {}
    command(name, handler) {
      commandRegistry[name] = handler;
    }
    view() {}
    start() {
      return startMock();
    }
  }

  return { App, __commandRegistry: commandRegistry, __startMock: startMock };
});

const { __commandRegistry } = await import('@slack/bolt');
await import('..');

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
