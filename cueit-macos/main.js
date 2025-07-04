import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packages = {
  api: 'cueit-api',
  admin: 'cueit-admin',
  activate: 'cueit-activate',
  slack: 'cueit-slack'
};
let win;

async function ensureEnvFiles() {
  let created = false;
  for (const dir of Object.values(packages)) {
    const envPath = path.join(__dirname, '..', dir, '.env');
    const example = path.join(__dirname, '..', dir, '.env.example');
    try {
      await fs.access(envPath);
    } catch {
      await fs.copyFile(example, envPath);
      created = true;
    }
  }
  return created;
}

function createWindow(showSetup) {
  win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile(showSetup ? 'setup.html' : 'index.html');
}

app.whenReady().then(async () => {
  const firstRun = await ensureEnvFiles();
  createWindow(firstRun);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('start', (_e, apps) => {
  const child = spawn(path.join(__dirname, '..', 'installers', 'start-all.sh'), [], { shell: true });
  child.stdin.write(`${apps}\n`);
  child.stdin.end();
  child.stdout.on('data', d => win.webContents.send('log', d.toString()));
  child.stderr.on('data', d => win.webContents.send('log', d.toString()));
});

ipcMain.handle('read-envs', async () => {
  const result = {};
  for (const [name, dir] of Object.entries(packages)) {
    const envPath = path.join(__dirname, '..', dir, '.env');
    result[name] = await fs.readFile(envPath, 'utf8');
  }
  return result;
});

ipcMain.handle('write-envs', async (_e, envs) => {
  for (const [name, content] of Object.entries(envs)) {
    const dir = packages[name];
    if (!dir) continue;
    const envPath = path.join(__dirname, '..', dir, '.env');
    await fs.writeFile(envPath, content);
  }
});
