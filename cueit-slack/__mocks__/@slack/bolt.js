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

module.exports = { App, __commandRegistry: commandRegistry, __startMock: startMock };
