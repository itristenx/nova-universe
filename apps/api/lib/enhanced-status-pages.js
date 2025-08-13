export const statusPageService = {
  async createStatusPage(input) {
    return { id: `sp_${Date.now()}`, published: true, incident_history_days: 7, ...input };
  },
  async getStatusPage(slug) {
    return { id: `sp_${slug}`, slug, title: slug, published: true, incident_history_days: 7 };
  },
  async generateStatusPageHTML(statusPage, monitors, incidents) {
    return `<html><body><h1>${statusPage.title}</h1><p>Monitors: ${monitors.length}</p></body></html>`;
  },
  async generateStatusBadge(badge, status, uptime) {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='20'><rect width='120' height='20' fill='#555'/><text x='60' y='14' fill='#fff' font-family='Verdana' font-size='11' text-anchor='middle'>${status} ${uptime}%</text></svg>`;
  }
};

export default statusPageService;