// Browsers must never inherit provider credentials or runtime injection settings.
const BROWSER_ENVIRONMENT_KEYS = Object.freeze(['HOME', 'PATH', 'TMPDIR', 'LANG']);

function createBrowserEnvironment(source = process.env) {
  const environment = Object.create(null);
  if (!source || typeof source !== 'object') return environment;
  for (const key of BROWSER_ENVIRONMENT_KEYS) {
    if (!Object.hasOwn(source, key)) continue;
    const value = source[key];
    if (typeof value === 'string') environment[key] = value;
  }
  return environment;
}

module.exports = { createBrowserEnvironment };
