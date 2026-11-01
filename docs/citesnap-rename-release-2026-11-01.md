# CiteSnap 0.2.4 beta 1 · 2026-11-01

The owner approved the CiteSnap name, reviewed the company/website/product mention-query positioning, and authorized repository/app renaming and publication. This release applies that approved copy to About, English/Chinese README and the current application.

## Identity and compatibility

The existing GitHub repository was renamed in place from maxuod/answerpouch to maxuod/CiteSnap; its repository ID remains 1441440165. About uses the reviewed English description. Current source package, new CLI entry, application/window/Info.plist, new capture labels, native export filename, DMG and install attachment use CiteSnap.

For compatibility, keep `com.maxuod.answerpouch`, `answerpouch://desktop`, existing IPC/localStorage keys, `~/Library/Application Support/AnswerPouch/` and evidence kinds. Startup explicitly selects the legacy user/session data directory. No profile or evidence migration/copy is needed. Old capture bytes/hashes and old release records are not relabeled. New capture metadata can identify CiteSnap; the v1 reader still accepts AnswerPouch. Existing getaudit consumers stay pinned to 0.1.0 and the original installed app was not changed.

## Checks

- 239 tests passed plus one existing opt-in skip / 11 files. Focused identity tests cover default legacy data, explicit test-directory overrides and linked/relative-root rejection. A protocol regression checks old AnswerPouch evidence without mutation.
- Signed local candidate: 280 manifest entries / 32 checked source/assets match. Info.plist reports CiteSnap / 0.2.4 / macOS 13+ with the stable compatibility bundle ID.
- Packaged fresh UI, bilingual layout, explicit preparation failure/reuse and localhost browser persistence passed. Original orange/white style and mouthless mascot remain.
- Native 0.2.3 → 0.2.4 acceptance used isolated synthetic data: Chinese, frozen question hash, workspace/evidence bytes and profile marker preserved. New UI displays CiteSnap. Native export defaults to CiteSnap while its old-run JSON equals the original. No replay or real-platform request occurred; real-owner session restoration was not tested.
- Packaged collector tests intercepted synthetic pages only: four captured answers/citations, one access restriction and one held unsubmitted task, exact questions and fresh contexts; minimal four-key child environment and host defaults retained. No new real questions or account/password interaction.
- DMG verified and mounted read-only: 280 app entries, local signature, Applications shortcut, bilingual install/upgrade guidance and notices passed. External Chrome for Testing is not bundled.

Installer: `CiteSnap-0.2.4-mac-arm64-beta.dmg` · 137,760,112 bytes · SHA-256 `23af6ba0263da0edeb2e9888eaac3dac9db5620e6a07fe679088313516f1a922`.

[Release](https://github.com/maxuod/CiteSnap/releases/tag/v0.2.4-beta.1) · [upgrade receipt](rename-upgrade-check-0.2.4.json) · [package](packaged-check-0.2.4.json) · [first use](beta-ui-check-0.2.4.json) · [DMG](dmg-check-0.2.4.json).

Developer ID signing/notarization remain deferred by the owner. The strict notarized-release check still reports developer_id_and_hardened_runtime_required and is not claimed as passed. Another clean Mac's internet-download installation, real owner login restoration and broader real-platform/account acceptance remain unverified. The release is a public beta; prior Copilot evidence retains its original version scope. Publication and anonymous-download checks are recorded after upload.
