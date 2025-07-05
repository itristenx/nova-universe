import theme from './theme.js';

document.documentElement.style.setProperty('--spacing-md', theme.spacing.md);
document.documentElement.style.setProperty('--font-sans', theme.fonts.sans.join(','));

const envsDiv = document.getElementById('envs');
const saveButton = document.getElementById('save');

(async () => {
  const envs = await window.electronAPI.readEnvs();
  Object.entries(envs).forEach(([name, content]) => {
    const wrap = document.createElement('div');
    wrap.className = 'env-block';
    wrap.innerHTML = `<h2>${name}</h2><textarea id="${name}">${content}</textarea>`;
    envsDiv.appendChild(wrap);
  });
})();

saveButton.addEventListener('click', async () => {
  const data = {};
  envsDiv.querySelectorAll('textarea').forEach(t => { data[t.id] = t.value; });
  await window.electronAPI.writeEnvs(data);
  await window.electronAPI.openAdmin();
  window.location = 'index.html';
});
