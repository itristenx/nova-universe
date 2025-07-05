import { mkdtemp, mkdir, writeFile, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const apps = ['cueit-api', 'cueit-admin', 'cueit-activate', 'cueit-slack'];
const scriptPath = new URL('..', import.meta.url);
const initScript = join(scriptPath.pathname, 'init-env.sh');

describe('init-env.sh', () => {
  let tmp;
  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), 'cueit-'));
    for (const app of apps) {
      const dir = join(tmp, app);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, '.env.example'), 'VAR=1\n');
    }
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('creates .env files next to .env.example', async () => {
    await execFileAsync(initScript, { cwd: tmp });

    for (const app of apps) {
      const examplePath = join(tmp, app, '.env.example');
      const envPath = join(tmp, app, '.env');
      const [example, env] = await Promise.all([
        readFile(examplePath, 'utf8'),
        readFile(envPath, 'utf8'),
      ]);
      expect(env).toBe(example);
    }
  });
});
