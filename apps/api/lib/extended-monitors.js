export const extendedMonitorService = {
  async runMonitorCheck(check) {
    return {
      success: true,
      responseTime: 123,
      statusCode: 200,
      message: 'Extended monitor check simulated',
      data: { type: check?.type, simulated: true },
    };
  },
};

export default extendedMonitorService;
