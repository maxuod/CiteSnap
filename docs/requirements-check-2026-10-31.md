# Requested end-state audit · 2026-10-31

The goal is not complete. This audit keeps the requested customer-use outcome as the standard; local source/tests are not a substitute for a working customer download and actual own-account collection.

| Requirement | Authoritative evidence inspected | Current result |
|---|---|---|
| Separate local collector from hosted web/GEO analysis | Independent answerpouch and getaudit-web Git roots and commits; original app uses a fixed0.1.0 archive | Implemented; the installed original app was not replaced |
| Hosted website source private on GitHub | Fresh GitHub metadata: maxuod/getaudit-web isPrivate:true, default branch codex/initial-web-project; pushed commit0faff98dcacaa23eb5062188c7cc3500396f48e6 | Verified private; no deployment in separation |
| Ordinary customer downloads/opens without Node, commands, developer keys or separate browser install |0.2.0 local-test DMG,642-entry integrity/symlink/signature audit; bundled browser startup; native packaged empty window | Local candidate works; frictionless customer download remains unverified because Developer ID/notarization and clean-machine installation are missing |
| Customer uses their own platform account | Desktop source account gating; every question verifies actual signed-in DOM; real Chromium synthetic account check passed for two sources | Implemented guard; real supported-platform own-account sign-in and captured answers remain unverified |
| Warn for frequent collection and suspension risk | English/Chinese risk text, high-frequency preview, explicit risk acknowledgement, repeat acknowledgement and persisted rolling guard | Implemented and source/UI/unit checked; limits are not a platform safety promise |
|1. Freeze local questions first | Exact text/order SHA-256 file format, native save plus tamper/duplicate tests | Verified with synthetic/local files; freezing sends no question |
|2. Import frozen questions | Native chooser/import-last + strict hash/schema verification, independent local copy | Verified; import sends no question |
|3. Automatically collect answers from selected sources | Actual packaged collector with bundled Chromium: two selected sources × two exact frozen questions, four new contexts and four saved captures | Full engine path verified against synthetic intercepted pages. Actual provider behavior is still unverified; no real question was sent |
| Show original answers, citations and evidence | Native evidence/export acceptance plus four real-engine fixture captures, raw artifact and canonical hash verification | Verified for bounded synthetic data; completeness unknown remains visible |
| No app location/country/proxy/IP/timezone override; use host network | Strict start schema rejects override fields; desktop hostEnvironment:true; ordinary/persistent option tests; real-engine launch options omit emulation/proxy; four-key child environment | Verified as an app-control invariant. Physical location/network country are unverified, and the app does not change OS VPN/proxy settings |
| Disclose regional participation limits | Bilingual host-network notes in native captures and source | Verified visible |
| Restriction/cancellation must not trigger a retry or paid/visible fallback | Unit suite and real-engine fixture rate limit: one saved restriction plus one held question; startup no replay | Verified for tested scenarios; no real provider restriction bypass |
| Independent local profiles/data; no web-account requirement | Separate bundle/profile/data roots and original installed-ASAR hash unchanged; no collector cloud uploader | Implemented and separation checked; no personal profile/old app connection was migrated |
| Preserve approved visual style and language | Six valid native synthetic captures; independent focus-fix verdict ship; DESIGN.md and sidecar | UI finding accepted at its review scope; not a public release certification |
| Latest request: confirm no old source/material/API residue in public repository | Fresh public mirror,12 main-repo commits,3 released archives,15 historical images; related448-commit fork; private audit report | No genuine sensitive credential found in audit scope. Old open-source desktop core, static-site assets and3Community releases are still public. They have not been deleted or history-rewritten |

## Genuine external prerequisites

Native CUA inspection returned: Mac is locked and automatic unlock could not unlock it. Do not attempt another automatic unlock or substitute personal browser state. The owner must unlock the Mac and complete their platform sign-in in AnswerPouch's dedicated windows for real-account acceptance. Questions/submission must stay within their explicit authorization; synthetic proof is never promoted to real collection.

The current local candidate's read-only distribution gate returns developer_id_and_hardened_runtime_required. The default code-signing identity inventory has0valid identities; the local build certificate is not Developer ID. Formal public delivery requires the owner's appropriate signing/notarization setup and clean supported-machine acceptance. No trust/security bypass is an alternative.

The latest public-repository request was an audit. Existing approved open-source core and published old artifacts remain as disclosed; no blanket deletion, public/private visibility change or Git history rewrite has been inferred. A customer-visible source/release cleanup must preserve the intended open-source boundary and be scoped explicitly.

## This continuation

Previous goal turn: progress (completed remote public-source/release/secret audit and found real remaining old public content). Current continuation: progress (added and ran a packaged real-browser collection-engine check yielding stronger end-to-end evidence). Mac lock and owner sign-in/signing are now verified external prerequisites. This is not a completion claim or a verified wait on a live external job.

A post-DMG source rerun found that default Vitest discovery followed the installer Applications shortcut into unrelated installed template tests. This was a verification-boundary failure, not a passing source suite. Both pre-fix failures and the corrected run are preserved under the ignored private validation directory. Explicit test discovery now targets only tests/; actual listing and rerun verify9project files,216passed and1existing opt-in skip, zero external files. See docs/test-discovery-boundary.json for hashes. No shipped runtime or UI changed.
