import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { URLS, resolveConfig, verifyPublicKey, renderConfig, checkProductionContent } from '../scripts/lib/supabaseConfig.js';
const key = 'sb_publishable_test';
const prod = { SUPABASE_URL: URLS.production, SUPABASE_ANON_KEY: key };

test('explicit modes and exactly one complete source', () => {
  assert.throws(() => resolveConfig(prod));
  assert.throws(() => resolveConfig(prod, 'staging'));
  assert.deepEqual(resolveConfig(prod, 'production'), { url: URLS.production, key });
  assert.equal(resolveConfig({ ...prod, SUPABASE_URL: URLS.development }, 'development').url, URLS.development);
  for (const name of ['SUPER_CONCTION_STRING', 'SUPABASE_CONNECTIONSTRING']) {
    assert.equal(resolveConfig({ [name]: `${URLS.production};${key}` }, 'production').key, key);
    assert.throws(() => resolveConfig({ ...prod, [name]: `${URLS.production};${key}` }, 'production'));
    assert.throws(() => resolveConfig({ [name]: 'invalid' }, 'production'));
  }
  assert.throws(() => resolveConfig({ SUPER_CONCTION_STRING: `${URLS.production};${key}`, SUPABASE_CONNECTIONSTRING: `${URLS.production};${key}` }, 'production'));
  for (const env of [{}, { SUPABASE_URL: URLS.production }, { SUPABASE_ANON_KEY: key }, { ...prod, SUPABASE_PROJECT_URL: URLS.production }]) {
    assert.throws(() => resolveConfig(env, 'production'));
  }
});

test('production rejects DEV variables, wrong URL, missing and privileged keys', () => {
  for (const env of [
    { ...prod, SUPABASE_URL: URLS.development },
    { ...prod, SUPABASE_URL: `${URLS.production}/` },
    { ...prod, SUPABASE_URL: 'https://example.com' },
    { ...prod, SUPABASE_DEV_KEY: key },
    { ...prod, SUPER_CONCTION_STRING: `${URLS.development};${key}` },
    { ...prod, SUPABASE_ANON_KEY: '' },
    { ...prod, SUPABASE_ANON_KEY: 'sb_secret_test' },
  ]) assert.throws(() => resolveConfig(env, 'production'));
  const jwt = payload => `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
  for (const payload of [{ role: 'service_role', ref: 'dhmkhogszktonyuynpns' }, { role: 'anon', ref: 'xbsequfhjqdcarsidxxa' }, { role: 'anon', ref: 'dhmkhogszktonyuynpns', exp: 1 }]) {
    assert.throws(() => resolveConfig({ ...prod, SUPABASE_ANON_KEY: jwt(payload) }, 'production'));
  }
  assert.ok(resolveConfig({ ...prod, SUPABASE_ANON_KEY: jwt({ role: 'anon', ref: 'dhmkhogszktonyuynpns' }) }, 'production'));
});

test('key verification fails closed on HTTP, network, and invalid response', async () => {
  const config = resolveConfig(prod, 'production');
  await verifyPublicKey(config, async (url, options) => {
    assert.equal(url, `${URLS.production}/auth/v1/settings`);
    assert.equal(options.headers.apikey, key);
    return { ok: true, json: async () => ({ external: { facebook: true } }) };
  });
  await assert.rejects(verifyPublicKey(config, async () => ({ ok: false, status: 401 })));
  await assert.rejects(verifyPublicKey(config, async () => { throw new Error('offline'); }));
  await assert.rejects(verifyPublicKey(config, async () => ({ ok: true, json: async () => ({}) })));
});

test('invalid generation leaves versioned file untouched', () => {
  const file = new URL('../supabase-config.js', import.meta.url);
  const before = fs.readFileSync(file, 'utf8');
  const result = spawnSync(process.execPath, ['scripts/generate-supabase-config.js', '--env', 'production'], { env: { ...prod, SUPABASE_URL: URLS.development } });
  assert.notEqual(result.status, 0);
  assert.equal(fs.readFileSync(file, 'utf8'), before);
});

test('Git checks staged content and pushed main target, even from another branch', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'supabase-hooks-'));
  const checker = new URL('../scripts/check-supabase-config.js', import.meta.url).pathname;
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  const run = (args, input) => spawnSync(process.execPath, [checker, ...args], { cwd: dir, input, encoding: 'utf8' });
  const write = mode => fs.writeFileSync(path.join(dir, 'supabase-config.js'), renderConfig({ url: URLS[mode], key }, mode));
  try {
    git('init', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    git('config', 'commit.gpgsign', 'false');
    write('development'); git('add', '.'); write('production');
    assert.notEqual(run(['--pre-commit']).status, 0);
    git('add', '.'); assert.equal(run(['--pre-commit']).status, 0);
    git('commit', '-m', 'prod'); const good = git('rev-parse', 'HEAD');
    write('development'); git('add', '.'); git('commit', '-m', 'dev'); const bad = git('rev-parse', 'HEAD');
    git('checkout', '-b', 'feature');
    assert.equal(run(['--pre-commit']).status, 0);
    assert.notEqual(run(['--pre-push'], `refs/heads/feature ${bad} refs/heads/main ${good}\n`).status, 0);
    assert.equal(run(['--pre-push'], `refs/heads/feature ${good} refs/heads/main ${bad}\n`).status, 0);
    assert.equal(run(['--pre-push'], `refs/heads/feature ${bad} refs/heads/feature ${good}\n`).status, 0);
    assert.equal(run(['--pre-push'], `delete ${'0'.repeat(40)} refs/heads/main ${good}\n`).status, 0);
    assert.throws(() => checkProductionContent(renderConfig({ url: URLS.development, key }, 'development')));
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
