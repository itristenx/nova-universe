import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('start', (_e, apps) => {
  const child = spawn(path.join(__dirname, '..', 'start-all.sh'), [], { shell: true });
  child.stdin.write(`${apps}\n`);
  child.stdin.end();
  child.stdout.on('data', d => win.webContents.send('log', d.toString()));
  child.stderr.on('data', d => win.webContents.send('log', d.toString()));
});
