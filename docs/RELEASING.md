# Release procedure

The owner authorized a public beta with Developer ID/notarization deferred. Label the pre-release and possible individual macOS approval clearly. `npm run release-check` remains the strict **notarized-release** gate; failure is expected for this beta and is not a pass.

1. Inspect the worktree. Update version/lockfile/changelog/guides; keep historical evidence and acceptance receipts immutable.
2. Run `npm ci`, `npm run check`, `npm test`, `npm run review:public`; scan intended public Git history/current files with a redacting secrets scanner. Review images/notices. No customer data, profiles, production config or signing files may be published.
3. Package on Apple Silicon macOS with `npm run package-desktop` and a separately configured identity. An owner config can be passed with `--local-signing-config` and an absolute private path; never commit it or its secrets. Do not bundle Chrome for Testing or restricted browser components. First preparation explicitly downloads the pinned browser from Google.
4. Verify bundle/source manifest, isolated fresh native UI, official browser preparation/integrity/cancellation and intercepted collection/export. No new real-provider questions without authorization. Do not migrate profiles or upgrade the original getaudit app.
5. Run `npm run package-beta`. Verify/mount DMG read-only; inspect bundle, shortcut, installation instructions and licenses. Keep current accepted deliverables, not duplicate full old apps; retain historical receipts.
6. Commit reviewed files, push the separate public repo and check CI. Tag the exact source. Create a **draft pre-release**, upload DMG/install guide/SHA256SUMS, verify uploaded digest and publish. Never label this beta stable/latest. Download anonymously and compare bytes/hash. Do not silently replace published versioned assets; issue a new version.
7. Record URLs, source commit/tag, app version, checksum and validation scope. Clean-Mac installation and Apple-notarized delivery remain separate future acceptance tasks, not prerequisites for this explicitly unnotarized beta.

CI is source-only, read-only-token and does not sign or upload binaries automatically.
