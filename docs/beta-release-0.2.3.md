# AnswerPouch 0.2.3 beta 1 · 2026-11-01

The owner authorized a public test download with Apple Developer ID/notarization deferred. This record distinguishes preparation/verification from the subsequent published GitHub state.

## Delivery

- Tag: `v0.2.3-beta.1`; application version: `0.2.3`.
- [Release page](https://github.com/maxuod/answerpouch/releases/tag/v0.2.3-beta.1) · [public source](https://github.com/maxuod/answerpouch).
- Installer: `AnswerPouch-0.2.3-mac-arm64-beta.dmg`, 137,763,569 bytes, SHA-256 `9c23951714cd10353311142f468b46597050173c44e06423c35cf216eb17c05e`.
- Apple Silicon macOS 13+. Local certificate signature; **no Developer ID/notarization**. Another clean Mac's internet-download installation is unverified. The strict notarized-release gate remains intentionally separate and does not pass.
- No external Chrome for Testing, Widevine or other restricted browser component is bundled. One explicit first-use action downloads the fixed official Google archive to the app data folder. Vendor bytes, quarantine and OS trust stay unchanged.
- Official archive: version `153.0.8010.12`, 190,970,181 bytes, SHA-256 `930e2a2c15addbaca1fe9b07bfa520667bced556d7988707186819cb4279ef3b`. Its executable hash matches the previously tested browser. The testing archive has no verified Developer ID resource seal; pinned archive bytes and runtime version, rather than an invented notarization claim, establish this check's scope.

## Verification

- Full source suite: **233 passed, one existing opt-in skip / 10 files**. Runtime tests cover exact size/hash, HTTP/redirect failure, cancellation/staging cleanup, no startup action, explicit reuse, preservation of existing files and escaping symlinks.
- Production dependency audit: zero reported vulnerabilities at this check. This is not an independent security certification.
- Packaged app: **280 manifest entries, 31 source/license assets matched**, strict local signature, isolated fresh native opening and localhost browser persistence. No browser included in resources.
- Native bilingual UI: visible first-use action; 860-pixel layout; deterministic explicit-download failure, zero automatic retries; separately downloaded official runtime recognized after reopen; frozen workspace bytes retained. No real account/profile used.
- Actual official runtime preparation: exact archive download/hash/version and a real minimal-environment browser launch against a local synthetic page passed; four allowed environment keys only. No provider request or OS trust change.
- Packaged collector: intercepted synthetic Gemini/Perplexity pages, four successful answer/citation captures, one restriction and one held unsubmitted task, exact question order, fresh contexts, saved synthetic session and retained evidence/export. All non-fixture requests blocked; no actual provider sampling.
- DMG verified and mounted read-only: all 280 app entries, local signature, Applications shortcut, bilingual guide and license files checked.
- Historical real Copilot acceptance remains [separate](copilot-native-read-fix-2026-10-31.md). No additional real question was submitted for this release. No personal/getaudit profile migration, source consumer upgrade or installed getaudit replacement occurred.

Machine-readable receipts: [package](packaged-check-0.2.3.json), [official runtime](official-runtime-check-0.2.3.json), [native UI](beta-ui-check-0.2.3.json), [collection engine](collection-engine-check-0.2.3.json), [DMG](dmg-check-0.2.3.json). Synthetic screenshots under `docs/qa/0.2.3/` contain no customer evidence.

Publication verification is recorded separately after the pre-release assets are made public. Broader real-account validation, independent customer acceptance, Developer ID and notarization remain future work; they do not block this explicitly unnotarized beta.
