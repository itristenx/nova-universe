import { jest } from '@jest/globals';

jest.unstable_mockModule('@slack/bolt', () => {
  const commandRegistry = {};
  const viewRegistry = {};
  const startMock = jest.fn().mockResolvedValue();

  class App {
    constructor() {}
    command(name, handler) {
      commandRegistry[name] = handler;
    }
    view(id, handler) {
      viewRegistry[id] = handler;
    }
    start() {
      return startMock();
    }
  }

  return {
    App,
    __commandRegistry: commandRegistry,
    __viewRegistry: viewRegistry,
    __startMock: startMock,
  };
});

jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const { __commandRegistry, __viewRegistry } = await import('@slack/bolt');
const axios = (await import('axios')).default;

beforeEach(() => {
  process.env.API_URL = 'http://localhost';
  process.env.JWT_SECRET = 'secret';
  delete process.env.VITE_ADMIN_URL;
  axios.get.mockReset();
  axios.post.mockReset();
});
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

  it('loads options from backend', async () => {
    axios.get.mockResolvedValue({
      data: { systems: ['Sys1', 'Sys2'], urgencyLevels: ['High', 'Low'] },
    });
    const handler = __commandRegistry['/new-ticket'];
    const ack = jest.fn().mockResolvedValue();
    const open = jest.fn().mockResolvedValue();
    const client = { views: { open } };
    const body = { trigger_id: 't', channel_id: 'C1', user: { id: 'U1' } };

    await handler({ ack, body, client });

    const view = open.mock.calls[0][0].view;
    const systemBlock = view.blocks.find((b) => b.block_id === 'system');
    const urgencyBlock = view.blocks.find((b) => b.block_id === 'urgency');
    expect(systemBlock.element.options.map((o) => o.value)).toEqual([
      'Sys1',
      'Sys2',
    ]);
    expect(urgencyBlock.element.options.map((o) => o.value)).toEqual([
      'High',
      'Low',
    ]);
  });

  it('sends ephemeral confirmation', async () => {
    const handler = __viewRegistry['ticket_submit'];
    axios.post.mockResolvedValue({
      data: { ticketId: '42', emailStatus: 'success' },
    });
    const ack = jest.fn().mockResolvedValue();
    const postEphemeral = jest.fn().mockResolvedValue();
    const client = { chat: { postEphemeral } };
    const view = {
      state: {
        values: {
          name: { value: { value: 'A' } },
          email: { value: { value: 'a@b.com' } },
          title: { value: { value: 'T' } },
          system: { value: { selected_option: { value: 'Sys1' } } },
          urgency: { value: { selected_option: { value: 'High' } } },
          description: { value: { value: '' } },
        },
      },
      private_metadata: 'C1',
    };
    const body = { user: { id: 'U1' } };

    await handler({ ack, body, view, client });

    expect(postEphemeral).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'C1', user: 'U1' })
    );
  });
});
