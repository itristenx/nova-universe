import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execFile);
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(__dirname, '..', '..');
const script = path.join(repoRoot, 'installers', 'make-installer.sh');

async function setupRepo(tmp) {
  const dirs = ['cueit-macos-swift', 'cueit-admin', 'cueit-api', 'cueit-activate', 'cueit-slack', 'design', 'installers'];
  for (const d of dirs) {
    await fs.mkdir(path.join(tmp, d), { recursive: true });
  }
  for (const p of ['cueit-api', 'cueit-admin', 'cueit-activate', 'cueit-slack']) {
    await fs.writeFile(path.join(tmp, p, '.env.example'), '');
  }
  await fs.writeFile(path.join(tmp, 'installers', 'start-all.sh'), '');
  await fs.mkdir(path.join(tmp, 'cueit-macos-swift', 'build', 'Build', 'Products', 'Release', 'CueITLauncher.app'), { recursive: true });
  await fs.copyFile(script, path.join(tmp, 'installers', 'make-installer.sh'));
}

async function setupBin(tmp) {
  const bin = path.join(tmp, 'bin');
  await fs.mkdir(bin);
  const scripts = {
    npm: '#!/usr/bin/env bash\nexit 0',
    xcodebuild: '#!/usr/bin/env bash\nexit 0',
    pkgbuild: '#!/usr/bin/env bash\nout="${@: -1}"\ntouch "$out"',
    productbuild: '#!/usr/bin/env bash\nout="${@: -1}"\ntouch "$out"'
  };
  for (const [name, content] of Object.entries(scripts)) {
    const p = path.join(bin, name);
    await fs.writeFile(p, content);
    await fs.chmod(p, 0o755);
  }
  return bin;
}

describe('make-installer.sh', () => {
  let tmp;
  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cueit-'));
    await setupRepo(tmp);
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  test('creates pkg file', async () => {
    const bin = await setupBin(tmp);
    const version = '1.2.3';
    const env = { PATH: `${bin}:${process.env.PATH}` };
    await exec(path.join(tmp, 'installers', 'make-installer.sh'), [version], { cwd: tmp, env });
    const pkgPath = path.join(tmp, 'cueit-macos-swift', `CueIT-${version}.pkg`);
    await fs.access(pkgPath);
  });
});
