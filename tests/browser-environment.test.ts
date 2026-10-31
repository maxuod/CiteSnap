import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const { createBrowserEnvironment } = createRequire(import.meta.url)('../lib/browser-environment.cjs');
const allowed = { HOME: '/synthetic/browser-home', PATH: '/synthetic/browser-bin', TMPDIR: '/synthetic/browser-temp', LANG: 'en_CA.UTF-8' };
const rejected = {
  OPENAI_API_KEY: 'SYNTHETIC_OPENAI_SECRET', ANTHROPIC_API_KEY: 'SYNTHETIC_ANTHROPIC_SECRET',
  PERPLEXITY_API_KEY: 'SYNTHETIC_PERPLEXITY_SECRET', GOOGLE_AI_API_KEY: 'SYNTHETIC_GOOGLE_AI_SECRET',
  DATAFORSEO_LOGIN: 'synthetic-login@example.invalid', DATAFORSEO_PASSWORD: 'SYNTHETIC_DATAFORSEO_PASSWORD',
  GSC_CLIENT_SECRET: 'SYNTHETIC_GSC_CLIENT_SECRET', GSC_REFRESH_TOKEN: 'SYNTHETIC_GSC_REFRESH_TOKEN',
  GSC_MCP_KEY: 'SYNTHETIC_GSC_MCP_KEY', GETGEO_GOOGLE_CLIENT_SECRET: 'SYNTHETIC_GOOGLE_CLIENT_SECRET',
  GETGEO_GOOGLE_ACCOUNT_SESSION: '{"refreshToken":"SYNTHETIC_MANAGED_GOOGLE_TOKEN"}',
  GETAUDIT_GOOGLE_DATA_SUBJECT: 'SYNTHETIC_ACCOUNT_SUBJECT',
  FUTURE_UNRECOGNIZED_SECRET: 'SYNTHETIC_FUTURE_SECRET', NODE_OPTIONS: '--no-warnings',
  HTTP_PROXY: 'http://synthetic-proxy.invalid:3128', HTTPS_PROXY: 'http://synthetic-secure-proxy.invalid:3128',
  ALL_PROXY: 'socks5://synthetic-all-proxy.invalid:1080', NO_PROXY: 'synthetic-private.invalid',
  DYLD_INSERT_LIBRARIES: '/synthetic/injection.dylib', LD_PRELOAD: '/synthetic/injection.so',
};

afterEach(() => vi.unstubAllEnvs());

describe('browser child-process environment boundary', () => {
  it('passes only the four explicitly allowed OS strings and leaves the credential-bearing parent untouched', () => {
    const source = Object.freeze({ ...allowed, ...rejected });
    const environment = createBrowserEnvironment(source);
    expect(Object.keys(environment).sort()).toEqual(['HOME', 'LANG', 'PATH', 'TMPDIR']);
    expect(environment).toEqual(allowed);
    expect(Object.getPrototypeOf(environment)).toBeNull();
    for (const [key, value] of Object.entries(rejected)) {
      expect(Object.hasOwn(environment, key)).toBe(false);
      expect(Object.values(environment)).not.toContain(value);
      expect(source[key as keyof typeof source]).toBe(value);
    }
  });

  it('does not consult unknown secret getters, inherit allowed keys, or copy prototype special properties', () => {
    const source = Object.create({ HOME: '/synthetic/inherited-home', PATH: '/synthetic/inherited-path', INHERITED_SECRET: 'SYNTHETIC_INHERITED_SECRET' });
    Object.defineProperty(source, 'OPENAI_API_KEY', { enumerable: true, get() { throw new Error('An excluded secret getter was consulted.'); } });
    Object.defineProperty(source, '__proto__', { enumerable: true, value: { POLLUTED_SECRET: 'SYNTHETIC_POLLUTED_SECRET' } });
    source.LANG = allowed.LANG;
    source.constructor = 'SYNTHETIC_CONSTRUCTOR_SECRET';
    const environment = createBrowserEnvironment(source);
    expect(environment).toEqual({ LANG: allowed.LANG });
    expect(Object.getPrototypeOf(environment)).toBeNull();
    expect('HOME' in environment).toBe(false);
    expect('INHERITED_SECRET' in environment).toBe(false);
    expect('POLLUTED_SECRET' in environment).toBe(false);
    expect('constructor' in environment).toBe(false);
    expect('__proto__' in environment).toBe(false);
  });

  it('omits absent and non-string values without manufacturing defaults or returning undefined', () => {
    const environment = createBrowserEnvironment({ HOME: undefined, PATH: 42, TMPDIR: null, LANG: '' });
    expect(environment).toEqual({ LANG: '' });
    expect(Object.keys(environment)).toEqual(['LANG']);
    expect(Object.getPrototypeOf(environment)).toBeNull();
  });

  it.each([null, false, 42, 'SYNTHETIC_INVALID_ENVIRONMENT', () => 'SYNTHETIC_INVALID_ENVIRONMENT'])('fails closed to an empty environment for invalid source %s', source => {
    const environment = createBrowserEnvironment(source);
    expect(environment).toBeDefined();
    expect(Object.keys(environment)).toEqual([]);
    expect(Object.getPrototypeOf(environment)).toBeNull();
  });

  it('returns independent snapshots without mutating its input', () => {
    const source = Object.freeze({ ...allowed, ...rejected });
    const first = createBrowserEnvironment(source), second = createBrowserEnvironment(source);
    expect(first).not.toBe(second);
    first.HOME = '/synthetic/child-mutation'; first.EXTRA_SECRET = 'SYNTHETIC_CHILD_ONLY';
    expect(second).toEqual(allowed);
    expect(source.HOME).toBe(allowed.HOME);
    expect(Object.hasOwn(second, 'EXTRA_SECRET')).toBe(false);
  });

  it('takes a fresh allowlisted process snapshot at each launch rather than caching credential-bearing startup state', () => {
    for (const [key, value] of Object.entries({ ...allowed, ...rejected })) vi.stubEnv(key, value);
    const first = createBrowserEnvironment();
    vi.stubEnv('PATH', '/synthetic/new-browser-bin'); vi.stubEnv('OPENAI_API_KEY', 'SYNTHETIC_ROTATED_PARENT_SECRET');
    const second = createBrowserEnvironment();
    expect(first).toEqual(allowed);
    expect(second).toEqual({ ...allowed, PATH: '/synthetic/new-browser-bin' });
    expect(first).not.toBe(second);
    expect(Object.getPrototypeOf(second)).toBeNull();
    expect(process.env.OPENAI_API_KEY).toBe('SYNTHETIC_ROTATED_PARENT_SECRET');
    expect(Object.hasOwn(second, 'OPENAI_API_KEY')).toBe(false);
  });
});
