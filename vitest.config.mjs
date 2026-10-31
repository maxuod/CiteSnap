import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    // A DMG staging folder contains an Applications shortcut. Test discovery
    // must never walk that link into unrelated installed software.
    dir: 'tests',
    include: ['**/*.test.ts'],
  },
});
