import { jest } from '@jest/globals';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

jest.unstable_mockModule('electron', () => {
  return {
    BrowserWindow: jest.fn().mockImplementation(() => ({ loadFile: jest.fn() })),
    ipcMain: { handle: jest.fn() },
    app: { whenReady: () => Promise.resolve(), on: jest.fn() }
  };
});

const { ensureEnvFiles, createWindow } = await import('../main.js');
const { BrowserWindow } = await import('electron');

function makePkgDir(base, name) {
  const dir = path.join(base, name);
  return fs.mkdir(dir, { recursive: true }).then(() => dir);
}

describe('ensureEnvFiles', () => {
  test('copies example files on first run', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cueit-'));
    for (const p of ['cueit-api', 'cueit-admin', 'cueit-activate', 'cueit-slack']) {
      const d = await makePkgDir(tmp, p);
      await fs.writeFile(path.join(d, '.env.example'), 'DATA');
    }
    const created = await ensureEnvFiles(tmp);
    expect(created).toBe(true);
    for (const p of ['cueit-api', 'cueit-admin', 'cueit-activate', 'cueit-slack']) {
      const content = await fs.readFile(path.join(tmp, p, '.env'), 'utf8');
      expect(content).toBe('DATA');
    }
  });

  test('returns false when envs exist', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cueit-'));
    for (const p of ['cueit-api', 'cueit-admin', 'cueit-activate', 'cueit-slack']) {
      const d = await makePkgDir(tmp, p);
      await fs.writeFile(path.join(d, '.env.example'), 'X');
      await fs.writeFile(path.join(d, '.env'), 'X');
    }
    const created = await ensureEnvFiles(tmp);
    expect(created).toBe(false);
  });
});

describe('createWindow', () => {
  test('loads setup page when first run', () => {
    createWindow(true);
    const win = BrowserWindow.mock.results[0].value;
    expect(win.loadFile).toHaveBeenCalledWith('setup.html');
  });

  test('loads index page otherwise', () => {
    createWindow(false);
    const win = BrowserWindow.mock.results[1].value;
    expect(win.loadFile).toHaveBeenCalledWith('index.html');
  });
});

