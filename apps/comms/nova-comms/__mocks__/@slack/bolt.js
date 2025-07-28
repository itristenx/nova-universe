import { jest } from '@jest/globals';

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

export { App, commandRegistry as __commandRegistry, startMock as __startMock };
