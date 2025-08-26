export const statusPageService = {
  async createStatusPage(input) {
    return { id: `sp_${Date.now()}`, published: true, incident_history_days: 7, ...input };
  },
  async getStatusPage(slug) {
    return { id: `sp_${slug}`, slug, title: slug, published: true, incident_history_days: 7 };
  },
  async generateStatusPageHTML(statusPage, monitors, incidents) {
    const recentIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.created_at || incident.startedAt);
      const daysAgo = statusPage.incident_history_days || 7;
      const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      return incidentDate > cutoffDate;
    });

    const incidentHtml = recentIncidents.length > 0 
      ? `<div class="incidents">
           <h2>Recent Incidents</h2>
           ${recentIncidents.map(incident => `
             <div class="incident ${incident.severity}">
               <strong>${incident.title || incident.summary}</strong>
               <span class="status">${incident.status}</span>
               <small>${new Date(incident.created_at || incident.startedAt).toLocaleDateString()}</small>
             </div>
           `).join('')}
         </div>`
      : '<div class="no-incidents"><p>No recent incidents to report.</p></div>';

    return `<html>
      <head>
        <title>${statusPage.title} - Status</title>
        <style>
          .incidents { margin: 20px 0; }
          .incident { padding: 10px; margin: 5px 0; border-left: 4px solid #ddd; }
          .incident.high { border-color: #ff9500; }
          .incident.critical { border-color: #ff4444; }
          .no-incidents { color: #28a745; }
        </style>
      </head>
      <body>
        <h1>${statusPage.title}</h1>
        <p>Monitors: ${monitors.length}</p>
        ${incidentHtml}
      </body>
    </html>`;
  },
  async generateStatusBadge(badge, status, uptime) {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='20'><rect width='120' height='20' fill='#555'/><text x='60' y='14' fill='#fff' font-family='Verdana' font-size='11' text-anchor='middle'>${status} ${uptime}%</text></svg>`;
  },
};

export default statusPageService;
