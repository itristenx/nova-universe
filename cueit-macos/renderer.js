import theme from './theme.js';

document.documentElement.style.setProperty('--spacing-md', theme.spacing.md);
document.documentElement.style.setProperty('--font-sans', theme.fonts.sans.join(','));

document.getElementById('start').addEventListener('click', () => {
  const apps = ['api', 'admin', 'activate', 'slack']
    .filter(id => document.getElementById(id).checked)
    .join(',');
  window.electronAPI.start(apps);
});

const log = document.getElementById('log');
window.electronAPI.onLog(line => {
  log.value += line;
  log.scrollTop = log.scrollHeight;
});
