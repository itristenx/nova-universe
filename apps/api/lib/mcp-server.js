export const novaMCPServer = {
  isServerRunning: false,
  serverPort: null,
  getServerInfo() {
    return { name: 'MCP Stub', version: '0.0.0' };
  },
  async start(port = 0) {
    this.isServerRunning = true;
    this.serverPort = port || 9234;
    return this.serverPort;
  },
};

export default novaMCPServer;