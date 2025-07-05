import { app, BrowserWindow, ipcMain, shell } from 'electron';
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
let adminWin;

async function ensureEnvFiles(baseDir = path.join(__dirname, '..')) {
  let created = false;
  for (const dir of Object.values(packages)) {
    const envPath = path.join(baseDir, dir, '.env');
    const example = path.join(baseDir, dir, '.env.example');
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

function createAdminWindow() {
  if (adminWin) {
    adminWin.focus();
    return;
  }
  adminWin = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  adminWin.loadFile(path.join(__dirname, '..', 'cueit-admin', 'dist', 'index.html'));
  adminWin.on('closed', () => { adminWin = null; });
}

async function start() {
  const firstRun = await ensureEnvFiles();
  createWindow(firstRun);
}

if (process.env.NODE_ENV !== 'test') {
  app.whenReady().then(start);
}

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

ipcMain.handle('open-external', (_e, url) => {
  shell.openExternal(url);
});

ipcMain.handle('open-admin', () => {
  createAdminWindow();
});

export { ensureEnvFiles, createWindow, start, createAdminWindow };
