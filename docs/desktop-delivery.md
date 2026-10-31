# AnswerPouch local desktop delivery · 2026-10-31

## Delivered source and artifact

Independent local project: /Volumes/X9 Pro/Developer/maxuod/answerpouch. Version 0.2.0, initial target Apple Silicon macOS 13+. No public collector repository/package/release/download upload. Website source is separately private at https://github.com/maxuod/getaudit-web, commit 0faff98dcacaa23eb5062188c7cc3500396f48e6 (remote privacy and commit verified). Existing research-core visibility is unchanged.

Candidate: out/AnswerPouch-darwin-arm64/AnswerPouch.app. Local test image: out/AnswerPouch-0.2.0-mac-arm64-local-test.dmg, 335,361,773 bytes, SHA-256 fa79c970955c32d8f35ff7f06b11418b03a0cbc9846a3c35ce435d69259e5d02. The image includes the complete app/browser and an Applications shortcut. It is explicitly labeled local test only. No customer Node.js/config/browser installation is required by this candidate.

Electron 45.2.1; pinned Playwright 1.63.0 / Chrome for Testing 153.0.8010.12, revision1243. Browser source executable hash is recorded separately from the distributor-signed copy. Upstream testing build's linker ad-hoc signature was not claimed as a verified Google distribution signature. The final app, including browser, was separately signed with the owner's existing private local build certificate and passed deep/strict verification and a certificate-bound AnswerPouch requirement. No OS trust change, Gatekeeper bypass, Apple account or original getaudit connection was accessed.

## Customer flow

Freeze exact local questions -> import/validate file -> select sources -> own platform accounts -> explicit account-risk/local-network acknowledgements -> sequential automatic collection -> original answers/citations/evidence export. Starts empty. Supports English/Chinese and the owned orange mouthless identity. Import/read/language changes never collect. Observed account-proof failures are retained but excluded; restrictions stop remaining tasks; uncertain submissions never replay automatically.

Host browser defaults and actual network only. No app geography/proxy/IP/timezone override. System VPN/proxy effects are outside app control. Physical location and network country are unverified. Frequent requests can cause verification, limits or suspension; local interval/daily limits are not a safety guarantee.

## Validation

- Source suite: 216 passed, one pre-existing real-system-Chrome opt-in skip, 9 files. Two new host-mode tests cover ordinary/persistent launch options; packaging-link test rejects absolute/external links.
- Native Electron UI: real local save/import/export using isolated synthetic questions/evidence, account readiness guards, exact raw text and citation escaping, English/Chinese,1180/860 widths, keyboard language/account/background/evidence focus, normal close. Temporary QA data removed. No real provider question.
- Independent finish review found one keyboard-continuity defect; final fix verdict ship scores that finding resolved. Six valid recaptures and token-bearing DESIGN.md/sidecar complete the UI handoff. No real provider/distribution certification follows from this review.
- Final packaged artifact: 642 file/symlink entries checked; 24 packaged runtime/assets match current source. All framework links remain relative and inside the bundle. Bundled browser launched twice against a localhost fixture; persistent cookie/localStorage survived normal restart. Host defaults observed en-US / America/Halifax. Four-key browser environment policy preserved. This is a localhost storage/runtime check, not platform-account acceptance.
- Final packaged application was independently opened/read through CUA. Empty English workspace, exact new branding, import-first gates, six sign-in-required sources, notices and zero planned requests were visible; no startup error remained. Screenshot docs/packaged-native-empty.png. App is left open for owner inspection. The automatic package test's packagedElectronLaunch false means that run used artifacts-only mode; this native CUA acceptance is separate.
- Website suite: 111 passed, four optional local-MySQL fixture skips, 115 total. This separation did not deploy or modify production configuration.

## Release boundary and next required acceptance

Read-only release gate currently returns ready:false, developer_id_and_hardened_runtime_required. Local certificate signing is not Developer ID or Apple notarization. Before a public frictionless download: configure the owner's Developer ID Application identity (ANSWERPOUCH_CODESIGN_IDENTITY, optional ANSWERPOUCH_CODESIGN_KEYCHAIN), rebuild with hardened runtime/timestamp, notarize and staple through the owner's Apple credentials, pass release-check, then test a downloaded copy on a clean supported Mac. No signing credential is embedded or committed. See https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution . No public upload/Apple submission occurred.

Each AI platform still needs real user-controlled own-account sign-in/capture acceptance. The agent did not enter passwords, solve challenges, restore personal/old app profiles or submit real research questions. Synthetic and localhost results do not guarantee access or complete responses.

The installed getaudit 0.4.47 was not restarted, installed over or changed. Its active source remains pinned to vendor/answerpouch/maxuod-answerpouch-0.1.0.tgz, not this desktop0.2.0. Legacy compatibility and historical evidence remain. Both ABOUT.md copies now identify the separate projects; old web/getaudit-prototype stays historical with an active-source pointer.
