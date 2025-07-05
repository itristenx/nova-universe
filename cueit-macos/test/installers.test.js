import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';
import { execFile } from 'child_process';

const exec = promisify(execFile);
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(__dirname, '..', '..');
const uninstall = path.join(root, 'installers', 'uninstall-macos.sh');
const upgrade = path.join(root, 'installers', 'upgrade-macos.sh');

async function setupApplications() {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cueit-'));
  const apps = path.join(tmp, 'Applications');
  await fs.mkdir(apps);
  await fs.symlink(apps, '/Applications');
  return { tmp, apps };
}

async function cleanup(tmp) {
  await fs.unlink('/Applications');
  await fs.rm(tmp, { recursive: true, force: true });
}

describe('macOS scripts', () => {
  test('uninstall-macos.sh removes app directory', async () => {
    const { tmp, apps } = await setupApplications();
    const appDir = path.join(apps, 'CueIT.app');
    await fs.mkdir(appDir);
    try {
      await exec(uninstall);
      await expect(fs.access(appDir)).rejects.toThrow();
    } finally {
      await cleanup(tmp);
    }
  });

  test('upgrade-macos.sh replaces app directory', async () => {
    const { tmp, apps } = await setupApplications();
    const appDir = path.join(apps, 'CueIT.app');
    await fs.mkdir(appDir, { recursive: true });
    await fs.writeFile(path.join(appDir, 'version.txt'), 'old');
    const pkg = path.join(tmp, 'dummy.pkg');
    await fs.writeFile(pkg, '');
    const bin = path.join(tmp, 'bin');
    await fs.mkdir(bin);
    await fs.writeFile(path.join(bin, 'sudo'), '#!/usr/bin/env bash\n"$@"');
    await fs.writeFile(path.join(bin, 'installer'), '#!/usr/bin/env bash\nmkdir -p /Applications/CueIT.app\necho new > /Applications/CueIT.app/version.txt');
    await fs.chmod(path.join(bin, 'sudo'), 0o755);
    await fs.chmod(path.join(bin, 'installer'), 0o755);
    try {
      await exec(upgrade, [pkg], { env: { PATH: `${bin}:${process.env.PATH}` } });
      const content = await fs.readFile(path.join(appDir, 'version.txt'), 'utf8');
      expect(content.trim()).toBe('new');
    } finally {
      await cleanup(tmp);
    }
  });
});
