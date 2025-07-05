import theme from './theme.js';

document.documentElement.style.setProperty('--spacing-md', theme.spacing.md);
document.documentElement.style.setProperty('--font-sans', theme.fonts.sans.join(','));

const urls = {
  api: 'http://localhost:3000',
  admin: 'http://localhost:5173',
  activate: 'http://localhost:5174'
};

const status = document.getElementById('status');
document.getElementById('start').addEventListener('click', () => {
  const selected = ['api', 'admin', 'activate', 'slack']
    .filter(id => document.getElementById(id).checked);
  window.electronAPI.start(selected.join(','));
  const lines = selected
    .filter(id => urls[id])
    .map(id => `${id}: ${urls[id]}`);
  status.textContent = `Servers starting...\n${lines.join('\n')}`;
  if (selected.includes('admin')) {
    window.electronAPI.openAdmin();
  }
});

document.getElementById('launch-admin').addEventListener('click', () => {
  window.electronAPI.openAdmin();
});

const log = document.getElementById('log');
window.electronAPI.onLog(line => {
  log.value += line;
  log.scrollTop = log.scrollHeight;
});
