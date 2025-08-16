export const advancedFeaturesService = {
  async isMonitorInMaintenance(monitorId) {
    return false;
  },
  async createTag(tag) {
    return { id: `tag_${Date.now()}`, ...tag };
  },
  async createMaintenanceWindow(win) {
    return { id: `mw_${Date.now()}`, status: 'scheduled', ...win };
  },
};

export default advancedFeaturesService;
