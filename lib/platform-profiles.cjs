const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { createBrowserEnvironment } = require('./browser-environment.cjs');

// These are app-owned login profiles, never the user's normal Chrome profile.
// DuckDuckGo remains guest-only and must not acquire a saved login profile.
const SURFACES = new Set(['google_aio', 'chatgpt_search', 'gemini', 'bing_copilot', 'perplexity', 'grok']);
const MARKER = 'getaudit-login.json';
const PROFILE_ERROR = 'The dedicated browser profile is unavailable. Your saved login has not been deleted.';
const record = value => value && typeof value === 'object' && !Array.isArray(value);

function createPlatformProfiles({ root, chromium, executablePath, hostEnvironment=false }) {
  if (typeof root !== 'string' || !path.isAbsolute(root) || path.resolve(root) === path.parse(root).root || path.resolve(root) === os.homedir())
    throw new Error('A dedicated absolute browser profile directory is required.');
  const directory = path.resolve(root);
  if (/(?:^|[\\/])(?:Google[\\/]Chrome(?: Beta| Canary| Dev)?|Application Support[\\/]Chromium|Microsoft[\\/]Edge|\.config[\\/](?:google-chrome|chromium|microsoft-edge))(?:[\\/]|$)/i.test(directory))
    throw new Error('Personal browser profiles cannot be used for sampling.');
  if (!chromium || typeof chromium.launchPersistentContext !== 'function') throw new Error('Persistent browser support is unavailable.');
  const active = new Map(), operations = new Map();

  function profile(surface) {
    if (!SURFACES.has(surface)) throw new Error('This platform does not support saved browser logins.');
    return path.join(directory, surface);
  }
  function ordinaryDirectory(file, create = false) {
    if (create && !fs.existsSync(file)) fs.mkdirSync(file, { recursive: true, mode: 0o700 });
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error(PROFILE_ERROR);
    if (create) fs.chmodSync(file, 0o700);
  }
  function ordinaryFile(file) {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(PROFILE_ERROR);
    return stat;
  }
  function atomicJson(file, value) {
    const temporary = file + '.' + randomUUID() + '.tmp';
    try {
      if (fs.existsSync(file)) ordinaryFile(file);
      fs.writeFileSync(temporary, JSON.stringify(value), { flag: 'wx', mode: 0o600 });
      fs.renameSync(temporary, file);
    } finally {
      try { fs.unlinkSync(temporary); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  function prepareDirectory(surface) {
    const target = profile(surface);
    ordinaryDirectory(directory, true);
    ordinaryDirectory(target, true);
    const defaults = path.join(target, 'Default');
    ordinaryDirectory(defaults, true);
    const preferences = path.join(defaults, 'Preferences');
    let saved = {};
    if (fs.existsSync(preferences)) {
      if (ordinaryFile(preferences).size > 16 * 1024 * 1024) throw new Error(PROFILE_ERROR);
      try { saved = JSON.parse(fs.readFileSync(preferences, 'utf8')); } catch { throw new Error(PROFILE_ERROR); }
      if (!record(saved)) throw new Error(PROFILE_ERROR);
    }
    // Pair Chromium's restore preference with --restore-last-session below:
    // the preference alone does not reliably restore session cookies in headless
    // Chrome. Browser-managed tokens never become a storageState export here.
    saved.session = { ...(record(saved.session) ? saved.session : {}), restore_on_startup: 1 };
    atomicJson(preferences, saved);
    return target;
  }
  function serialize(surface, work) {
    profile(surface);
    const previous = operations.get(surface) || Promise.resolve();
    const operation = previous.catch(() => {}).then(work);
    operations.set(surface, operation);
    const done = () => { if (operations.get(surface) === operation) operations.delete(surface); };
    void operation.then(done, done);
    return operation;
  }
  async function closeActive(surface) {
    const current = active.get(surface);
    if (!current) return;
    try { if (current.alive()) await current.context.close(); }
    catch { if (current.alive()) throw new Error('The dedicated browser is still closing. Try again once it has closed.'); }
    if (active.get(surface) === current) active.delete(surface);
  }
  function has(surface) {
    const target = profile(surface);
    try {
      ordinaryDirectory(directory); ordinaryDirectory(target); ordinaryDirectory(path.join(target, 'Default'));
      const marker = path.join(target, MARKER);
      if (ordinaryFile(marker).size > 4096) return false;
      const saved = JSON.parse(fs.readFileSync(marker, 'utf8'));
      return saved?.version === 1 && saved.surface === surface && saved.verified === true;
    } catch { return false; }
  }
  function open(surface, config, mode = 'silent') {
    if (!['silent', 'visible'].includes(mode)) return Promise.reject(new Error('Unsupported browser mode.'));
    const locale = config?.locale, timezone = config?.timezone;
    if (typeof locale !== 'string' || !locale || locale.length > 100 || typeof timezone !== 'string' || !timezone || timezone.length > 100)
      return Promise.reject(new Error('Browser locale and timezone are required.'));
    return serialize(surface, async () => {
      const existing = active.get(surface);
      if (existing?.alive() && existing.mode === mode && existing.locale === locale && existing.timezone === timezone) return existing;
      await closeActive(surface);
      let context;
      try {
        const target = prepareDirectory(surface);
        context = await chromium.launchPersistentContext(target, {
          executablePath, headless: mode === 'silent', chromiumSandbox: true, timeout: 30_000,
          env: createBrowserEnvironment(),
          ...(hostEnvironment?{}:{locale, timezoneId: timezone}), viewport: { width: 1280, height: 900 },
          acceptDownloads: false, permissions: [], serviceWorkers: 'block',
          args: ['--restore-last-session'],
        });
        let closed = false;
        const current = { context, mode, locale, timezone, alive: () => !closed && (context.browser?.()?.isConnected?.() ?? true) };
        context.once?.('close', () => { closed = true; if (active.get(surface) === current) active.delete(surface); });
        await context.grantPermissions([]);
        if (!current.alive()) throw new Error(PROFILE_ERROR);
        active.set(surface, current);
        return current;
      } catch {
        await context?.close().catch(() => {});
        throw new Error(PROFILE_ERROR);
      }
    });
  }
  function markVerified(surface) {
    return serialize(surface, () => {
      if (!active.get(surface)?.alive()) throw new Error('Open and confirm this platform login before saving it.');
      const target = profile(surface);
      ordinaryDirectory(directory); ordinaryDirectory(target);
      atomicJson(path.join(target, MARKER), { version: 1, surface, verified: true });
    });
  }
  function update(surface, sourceContext) {
    return serialize(surface, async () => {
      try {
        const target = active.get(surface);
        if (!target?.alive()) throw new Error('Closed profile');
        if (sourceContext === target.context) return;
        // Auth refreshes from the isolated question context return to Chromium's
        // dedicated profile only in memory. The caller must establish the actual
        // account and official entry; a refresh never creates a verified marker.
        const state = await sourceContext.storageState({ indexedDB: true });
        if (!target.alive() || !record(state) || !Array.isArray(state.cookies) || !Array.isArray(state.origins)) throw new Error('Unavailable state');
        await target.context.setStorageState(state);
      } catch {
        throw new Error('The browser login could not be refreshed. Your saved profile has not been deleted.');
      }
    });
  }
  function close(surface) {
    if (surface !== undefined) return serialize(surface, () => closeActive(surface));
    return Promise.all([...new Set([...active.keys(), ...operations.keys()])].map(value => serialize(value, () => closeActive(value)))).then(() => {});
  }
  function forget(surface) {
    return serialize(surface, async () => {
      await closeActive(surface);
      const target = profile(surface);
      if (!fs.existsSync(directory)) return;
      ordinaryDirectory(directory);
      if (!fs.existsSync(target)) return;
      ordinaryDirectory(target);
      fs.rmSync(target, { recursive: true, force: true });
    });
  }
  return { has, open, markVerified, update, close, forget };
}

module.exports = { createPlatformProfiles };
