import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { EventEmitter } from 'node:events';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';

const require = createRequire(import.meta.url);
const { createPlatformProfiles } = require('../lib/platform-profiles.cjs');
const { createBrowserEnvironment } = require('../lib/browser-environment.cjs');
const config = { locale: 'en-CA', timezone: 'America/Toronto' };
const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const roots: string[] = [];
const managers: any[] = [];

afterEach(async () => {
  await Promise.allSettled(managers.splice(0).map(manager => manager.close()));
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'getaudit-profile-test-')); roots.push(root);
  const data = new Map<string, { cookie: string; local: string }>();
  const contexts: any[] = [];
  const chromium = { launchPersistentContext: vi.fn(async (directory: string, options: any) => {
    const saved = data.get(directory) || { cookie: '', local: '' };
    const context: any = new EventEmitter();
    context.directory = directory; context.options = options; context.closed = false;
    context.cookie = saved.cookie; context.local = saved.local;
    context.grantPermissions = vi.fn(async () => {});
    context.setStorageState = vi.fn(async (state: any) => {
      context.cookie = state.cookies[0]?.value ?? '';
      context.local = state.origins[0]?.localStorage[0]?.value ?? '';
    });
    context.browser = () => ({ isConnected: () => !context.closed });
    context.close = vi.fn(async () => {
      data.set(directory, { cookie: context.cookie, local: context.local });
      context.closed = true; context.emit('close');
    });
    context.page = { closed: false, close: async () => { context.page.closed = true; } };
    contexts.push(context); return context;
  }) };
  const fresh = () => { const manager = createPlatformProfiles({ root, chromium, executablePath }); managers.push(manager); return manager; };
  return { root, chromium, contexts, fresh, manager: fresh() };
}

describe('dedicated persistent platform login profiles', () => {
  it('keeps persistent visible, silent, restored and reopened browser environments credential-free', async () => {
    const f=fixture();
    const allowed={HOME:'/synthetic/browser-home',PATH:'/synthetic/browser-bin',TMPDIR:'/tmp',LANG:'en_CA.UTF-8'};
    const rejected={OPENAI_API_KEY:'SYNTHETIC_OPENAI_SECRET',ANTHROPIC_API_KEY:'SYNTHETIC_ANTHROPIC_SECRET',PERPLEXITY_API_KEY:'SYNTHETIC_PERPLEXITY_SECRET',GOOGLE_AI_API_KEY:'SYNTHETIC_GOOGLE_AI_SECRET',DATAFORSEO_LOGIN:'synthetic-login@example.invalid',DATAFORSEO_PASSWORD:'SYNTHETIC_DATAFORSEO_PASSWORD',GSC_REFRESH_TOKEN:'SYNTHETIC_GSC_REFRESH_TOKEN',GETGEO_GOOGLE_ACCOUNT_SESSION:'SYNTHETIC_GOOGLE_SESSION',FUTURE_SECRET:'SYNTHETIC_FUTURE_SECRET',NODE_OPTIONS:'--no-warnings',HTTPS_PROXY:'http://synthetic-proxy.invalid:3128'};
    for(const [key,value] of Object.entries({...allowed,...rejected}))vi.stubEnv(key,value);
    const first=await f.manager.open('chatgpt_search',config,'visible');first.context.cookie='SYNTHETIC_SAVED_COOKIE';
    await f.manager.markVerified('chatgpt_search');
    const silent=await f.manager.open('chatgpt_search',config,'silent');expect(silent.context.cookie).toBe('SYNTHETIC_SAVED_COOKIE');
    await f.manager.close();const restarted=f.fresh();expect(restarted.has('chatgpt_search')).toBe(true);
    const restored=await restarted.open('chatgpt_search',config,'visible');expect(restored.context.cookie).toBe('SYNTHETIC_SAVED_COOKIE');
    await restored.context.close();vi.stubEnv('PATH','/synthetic/reopened-browser-bin');
    const reopened=await restarted.open('chatgpt_search',config,'silent');expect(reopened.context.cookie).toBe('SYNTHETIC_SAVED_COOKIE');
    const calls=f.chromium.launchPersistentContext.mock.calls;
    expect(calls.map(([,options])=>options.headless)).toEqual([false,true,false,true]);
    for(const [index,[,options]] of calls.entries()){
      expect(options.env).toEqual({...allowed,...(index===3?{PATH:'/synthetic/reopened-browser-bin'}:{})});
      expect(Object.keys(options.env).sort()).toEqual(['HOME','LANG','PATH','TMPDIR']);expect(Object.getPrototypeOf(options.env)).toBeNull();
      for(const key of Object.keys(rejected))expect(Object.hasOwn(options.env,key)).toBe(false);
      if(index)expect(options.env).not.toBe(calls[index-1][1].env);
    }
    expect(process.env.OPENAI_API_KEY).toBe(rejected.OPENAI_API_KEY);expect(restarted.has('chatgpt_search')).toBe(true);
  });

  it('creates private app directories and saves only a verification marker after confirmation', async () => {
    const f = fixture(); expect(f.manager.has('gemini')).toBe(false);
    const handle = await f.manager.open('gemini', config);
    expect(handle.mode).toBe('silent'); expect(handle.alive()).toBe(true);
    expect(f.manager.has('gemini')).toBe(false);
    for (const directory of [f.root, join(f.root, 'gemini'), join(f.root, 'gemini', 'Default')]) expect(statSync(directory).mode & 0o777).toBe(0o700);
    const preferences = join(f.root, 'gemini', 'Default', 'Preferences');
    expect(JSON.parse(readFileSync(preferences, 'utf8'))).toEqual({ session: { restore_on_startup: 1 } });
    expect(statSync(preferences).mode & 0o777).toBe(0o600);
    expect(f.chromium.launchPersistentContext).toHaveBeenCalledWith(join(f.root, 'gemini'), expect.objectContaining({
      executablePath, headless: true, chromiumSandbox: true, locale: 'en-CA', timezoneId: 'America/Toronto',
      permissions: [], serviceWorkers: 'block', acceptDownloads: false,
    }));
    expect(f.contexts[0].options).not.toHaveProperty('storageState');
    expect(f.contexts[0].grantPermissions).toHaveBeenCalledWith([]);
    await f.manager.markVerified('gemini'); expect(f.manager.has('gemini')).toBe(true);
    const marker = join(f.root, 'gemini', 'getaudit-login.json');
    expect(JSON.parse(readFileSync(marker, 'utf8'))).toEqual({ version: 1, surface: 'gemini', verified: true });
    expect(statSync(marker).mode & 0o777).toBe(0o600);
  });

  it('keeps browser-managed cookies and local storage across page close, runtime close and a manager restart', async () => {
    const f = fixture(); const first = await f.manager.open('chatgpt_search', config, 'visible');
    first.context.cookie = 'SYNTHETIC COOKIE'; first.context.local = 'SYNTHETIC LOCAL';
    await f.manager.markVerified('chatgpt_search');
    await first.context.page.close(); expect(first.alive()).toBe(true); expect(f.manager.has('chatgpt_search')).toBe(true);
    await f.manager.close(); expect(first.alive()).toBe(false); expect(f.manager.has('chatgpt_search')).toBe(true);
    const restarted = f.fresh(); expect(restarted.has('chatgpt_search')).toBe(true);
    const restored = await restarted.open('chatgpt_search', config);
    expect(restored.context.cookie).toBe('SYNTHETIC COOKIE'); expect(restored.context.local).toBe('SYNTHETIC LOCAL');
    expect(JSON.stringify(readdirSync(join(f.root, 'chatgpt_search')))).not.toMatch(/storageState|cookie/i);
  });

  it('shares a pending launch and switches explicit modes only after closing the old context', async () => {
    const f = fixture();
    const [first, second] = await Promise.all([f.manager.open('gemini', config, 'visible'), f.manager.open('gemini', config, 'visible')]);
    expect(first).toBe(second); expect(f.chromium.launchPersistentContext).toHaveBeenCalledTimes(1);
    first.context.cookie = 'SYNTHETIC REFRESHED'; await f.manager.markVerified('gemini');
    const silent = await f.manager.open('gemini', config, 'silent');
    expect(first.context.closed).toBe(true); expect(silent.context.cookie).toBe('SYNTHETIC REFRESHED');
    expect(silent.mode).toBe('silent'); expect(silent.alive()).toBe(true); expect(f.manager.has('gemini')).toBe(true);
    expect(f.chromium.launchPersistentContext.mock.calls.map(call => call[1].headless)).toEqual([false, true]);
    const changed = await f.manager.open('gemini', { ...config, timezone: 'America/New_York' });
    expect(silent.alive()).toBe(false); expect(changed.context.options.timezoneId).toBe('America/New_York');
  });

  it('retains verified profiles after a browser disconnect and safely opens the same directory again', async () => {
    const f = fixture(); const handle = await f.manager.open('grok', config); await f.manager.markVerified('grok');
    await handle.context.close(); expect(handle.alive()).toBe(false); expect(f.manager.has('grok')).toBe(true);
    const replacement = await f.manager.open('grok', config);
    expect(replacement).not.toBe(handle); expect(replacement.alive()).toBe(true);
  });

  it('serializes close and forget behind an in-flight launch without a late profile resurrection', async () => {
    const f = fixture(); let release!: () => void; const gate = new Promise<void>(resolve => { release = resolve; });
    const launch = f.chromium.launchPersistentContext.getMockImplementation()!;
    f.chromium.launchPersistentContext.mockImplementationOnce(async (directory, options) => { await gate; return launch(directory, options); });
    const opening = f.manager.open('perplexity', config);
    const verified = f.manager.markVerified('perplexity');
    const forgetting = f.manager.forget('perplexity');
    release(); const handle = await opening; await verified; await forgetting;
    expect(handle.alive()).toBe(false); expect(f.manager.has('perplexity')).toBe(false); expect(existsSync(join(f.root, 'perplexity'))).toBe(false);
    const next = f.manager.open('perplexity', config); const closing = f.manager.close();
    await next; await closing; expect(f.contexts.at(-1).closed).toBe(true);
  });

  it('forgets only the selected allowlisted profile and preserves siblings and unrelated files', async () => {
    const f = fixture();
    await f.manager.open('gemini', config); await f.manager.markVerified('gemini');
    await f.manager.open('google_aio', config); await f.manager.markVerified('google_aio');
    writeFileSync(join(f.root, 'unrelated.txt'), 'keep');
    await f.manager.forget('gemini');
    expect(f.manager.has('gemini')).toBe(false); expect(f.manager.has('google_aio')).toBe(true);
    expect(readFileSync(join(f.root, 'unrelated.txt'), 'utf8')).toBe('keep');
    for (const invalid of ['../', 'constructor', 'duckduckgo_search_assist']) {
      expect(() => f.manager.has(invalid)).toThrow(/does not support/);
      expect(() => f.manager.forget(invalid)).toThrow(/does not support/);
    }
  });

  it('preserves existing Chromium preferences and refuses corrupt preferences without deleting the profile', async () => {
    const f = fixture(); const defaults = join(f.root, 'gemini', 'Default'); mkdirSync(defaults, { recursive: true });
    const preferences = join(defaults, 'Preferences');
    writeFileSync(preferences, JSON.stringify({ profile: { name: 'Dedicated' }, session: { untouched: true, restore_on_startup: 5 } }));
    await f.manager.open('gemini', config); await f.manager.close('gemini');
    expect(JSON.parse(readFileSync(preferences, 'utf8'))).toEqual({ profile: { name: 'Dedicated' }, session: { untouched: true, restore_on_startup: 1 } });
    writeFileSync(preferences, '{SYNTHETIC CORRUPT');
    await expect(f.manager.open('gemini', config)).rejects.toThrow(/unavailable/);
    expect(readFileSync(preferences, 'utf8')).toBe('{SYNTHETIC CORRUPT');
  });

  it('rejects root, profile and preferences symlinks and never removes their targets', async () => {
    const f = fixture(); const outside = mkdtempSync(join(tmpdir(), 'getaudit-profile-outside-')); roots.push(outside);
    writeFileSync(join(outside, 'keep.txt'), 'keep');
    symlinkSync(outside, join(f.root, 'gemini'));
    await expect(f.manager.open('gemini', config)).rejects.toThrow(/unavailable/);
    await expect(f.manager.forget('gemini')).rejects.toThrow(/unavailable/);
    expect(f.manager.has('gemini')).toBe(false); expect(readFileSync(join(outside, 'keep.txt'), 'utf8')).toBe('keep');
    const defaults = join(f.root, 'grok', 'Default'); mkdirSync(defaults, { recursive: true });
    symlinkSync(join(outside, 'keep.txt'), join(defaults, 'Preferences'));
    await expect(f.manager.open('grok', config)).rejects.toThrow(/unavailable/);
    expect(readFileSync(join(outside, 'keep.txt'), 'utf8')).toBe('keep');
    const alias = join(f.root, 'root-alias'); symlinkSync(outside, alias);
    const manager = createPlatformProfiles({ root: alias, chromium: f.chromium, executablePath }); managers.push(manager);
    await expect(manager.open('grok', config)).rejects.toThrow(/unavailable/);
  });

  it('does not mark failed launches as verified or return raw browser diagnostics', async () => {
    const f = fixture(); f.chromium.launchPersistentContext.mockRejectedValueOnce(new Error('SYNTHETIC SECRET BROWSER DIAGNOSTIC'));
    await expect(f.manager.open('bing_copilot', config)).rejects.toThrow('The dedicated browser profile is unavailable. Your saved login has not been deleted.');
    expect(f.manager.has('bing_copilot')).toBe(false);
    await expect(f.manager.markVerified('bing_copilot')).rejects.toThrow(/Open and confirm/);
    await f.manager.open('bing_copilot', config); expect(f.chromium.launchPersistentContext).toHaveBeenCalledTimes(2);
    await expect(f.manager.open('bing_copilot', config, 'surprise')).rejects.toThrow(/Unsupported/);
    await expect(f.manager.open('bing_copilot', {})).rejects.toThrow(/locale and timezone/);
  });

  it('copies rotating account storage in memory without creating a verification marker', async () => {
    const f = fixture(); await f.manager.open('gemini', config);
    const state = { cookies: [{ name: 'synthetic', value: 'SYNTHETIC ROTATED' }], origins: [{ origin: 'https://synthetic.invalid', localStorage: [{ name: 'synthetic', value: 'SYNTHETIC ROTATED LOCAL' }] }] };
    const source = { storageState: vi.fn(async () => state) };
    await f.manager.update('gemini', source);
    expect(source.storageState).toHaveBeenCalledWith({ indexedDB: true });
    expect(f.contexts[0].setStorageState).toHaveBeenCalledWith(state);
    expect(f.manager.has('gemini')).toBe(false);
    await f.manager.close(); const restarted = await f.fresh().open('gemini', config);
    expect(restarted.context.cookie).toBe('SYNTHETIC ROTATED'); expect(restarted.context.local).toBe('SYNTHETIC ROTATED LOCAL');
    expect(readdirSync(join(f.root, 'gemini'))).toEqual(['Default']);
  });

  it('keeps refresh failures bounded to a safe message and never resurrects a closed or forgotten profile', async () => {
    const f = fixture(); await f.manager.open('gemini', config); await f.manager.markVerified('gemini');
    const secret = 'SYNTHETIC PRIVATE DIAGNOSTIC';
    await expect(f.manager.update('gemini', { storageState: async () => { throw new Error(secret); } })).rejects.toThrow('The browser login could not be refreshed. Your saved profile has not been deleted.');
    expect(f.manager.has('gemini')).toBe(true);
    const source = { storageState: vi.fn(async () => ({ cookies: [], origins: [] })) };
    await f.manager.forget('gemini');
    await expect(f.manager.update('gemini', source)).rejects.toThrow(/could not be refreshed/);
    expect(source.storageState).not.toHaveBeenCalled(); expect(existsSync(join(f.root, 'gemini'))).toBe(false);
  });

  it('never deletes a profile when its browser cannot close', async () => {
    const f = fixture(); const handle = await f.manager.open('gemini', config); await f.manager.markVerified('gemini');
    handle.context.close.mockRejectedValueOnce(new Error('Still running'));
    await expect(f.manager.forget('gemini')).rejects.toThrow(/still closing/);
    expect(f.manager.has('gemini')).toBe(true); expect(handle.alive()).toBe(true);
    await f.manager.close();
  });

  it('requires a dedicated absolute root and refuses known personal browser paths', () => {
    const f = fixture();
    for (const root of [undefined, '', '.', '/', '/Users/any/Library/Application Support/Google/Chrome', '/Users/any/.config/chromium']) {
      expect(() => createPlatformProfiles({ root, chromium: f.chromium, executablePath })).toThrow();
    }
  });
});

// Opt-in, headless, synthetic localhost validation. It never opens provider
// websites, reads an existing profile or accesses application credentials.
it.runIf(process.env.GETAUDIT_PROFILE_BROWSER_TEST === '1' && existsSync(executablePath))('restores real Chromium session cookies, persistent cookies and local storage after restart', async () => {
  const root = mkdtempSync(join(tmpdir(), 'getaudit-profile-browser-')); roots.push(root);
  const server = createServer((_request, response) => { response.writeHead(200, { 'content-type': 'text/html' }); response.end('<title>Synthetic profile test</title>'); });
  await new Promise<void>(resolve => { server.listen(0, '127.0.0.1', resolve); });
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Synthetic server unavailable');
  const origin = `http://127.0.0.1:${address.port}`;
  const { chromium } = require('playwright-core');
  const create = () => { const manager = createPlatformProfiles({ root, chromium, executablePath }); managers.push(manager); return manager; };
  let manager = create();
  try {
    let handle = await manager.open('gemini', config);
    await handle.context.route('**/*', (route: any) => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    let page = await handle.context.newPage(); await page.goto(origin);
    await page.evaluate(() => {
      document.cookie = 'synthetic_session=SESSION; Path=/; SameSite=Lax';
      document.cookie = 'synthetic_persistent=PERSISTENT; Path=/; Max-Age=3600; SameSite=Lax';
      localStorage.setItem('synthetic_login', 'LOCAL');
    });
    await manager.markVerified('gemini'); await page.close(); await manager.close();
    manager = create(); expect(manager.has('gemini')).toBe(true);
    handle = await manager.open('gemini', config);
    await handle.context.route('**/*', (route: any) => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    page = await handle.context.newPage(); await page.goto(origin);
    const result = await page.evaluate(() => ({ cookies: document.cookie, local: localStorage.getItem('synthetic_login') }));
    expect(result.cookies).toContain('synthetic_session=SESSION');
    expect(result.cookies).toContain('synthetic_persistent=PERSISTENT'); expect(result.local).toBe('LOCAL');
    const sourceBrowser = await chromium.launch({ executablePath, headless: true, chromiumSandbox: true, env: createBrowserEnvironment() });
    try {
      const sourceContext = await sourceBrowser.newContext({ storageState: await handle.context.storageState({ indexedDB: true }) });
      await sourceContext.route('**/*', (route: any) => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
      const sourcePage = await sourceContext.newPage(); await sourcePage.goto(origin);
      await sourcePage.evaluate(() => {
        document.cookie = 'synthetic_session=ROTATED_SESSION; Path=/; SameSite=Lax';
        document.cookie = 'synthetic_persistent=ROTATED_PERSISTENT; Path=/; Max-Age=3600; SameSite=Lax';
        localStorage.setItem('synthetic_login', 'ROTATED_LOCAL');
      });
      await manager.update('gemini', sourceContext);
      await sourceContext.close();
    } finally { await sourceBrowser.close(); }
    await manager.close(); manager = create(); handle = await manager.open('gemini', config);
    await handle.context.route('**/*', (route: any) => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    page = await handle.context.newPage(); await page.goto(origin);
    const rotated = await page.evaluate(() => ({ cookies: document.cookie, local: localStorage.getItem('synthetic_login') }));
    expect(rotated.cookies).toContain('synthetic_session=ROTATED_SESSION');
    expect(rotated.cookies).toContain('synthetic_persistent=ROTATED_PERSISTENT'); expect(rotated.local).toBe('ROTATED_LOCAL');
    await manager.forget('gemini'); expect(manager.has('gemini')).toBe(false);
  } finally {
    await manager.close();
    await new Promise<void>((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); });
  }
}, 45_000);
