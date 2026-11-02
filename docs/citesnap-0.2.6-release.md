# CiteSnap 0.2.6 beta

This version introduces a flat, transparent ghost icon for the app and adds a matching illustration and actual interface screenshots to the English and Chinese README. The screenshots use an isolated empty workspace. The previous 0.2.5 release and its download remain available.

## Verification

- 239 source tests passed, with one existing opt-in skip; syntax and public-file boundary checks passed.
- The signed local application matched all 280 build-manifest entries and 35 source/assets. Its packaged macOS icon matched `desktop/assets/citesnap-flat.icns` byte for byte.
- Isolated packaged UI checks covered both languages, first-use browser preparation failure/reuse and synthetic workspace preservation. The README screenshots were captured from 0.2.6 with no renderer requests to external sites.
- The disk image was mounted read-only. The guide, app icon, Applications shortcut and local signature were verified. The external testing browser is not bundled.
- No real provider questions were submitted. Existing accounts, user evidence and application identifiers were not changed.

Installer: `CiteSnap-0.2.6-mac-arm64-beta.dmg`, 137,821,993 bytes, SHA-256 `a99a6a557bb73290f91a17b0022ef713c34ac7ea1c9387ca8380bc207df912a5`.

Apple Developer ID signing and notarization are deferred. Installation after an internet download on another clean Mac and real-account behavior of this version have not been verified. [Packaged check](packaged-check-0.2.6.json) · [native UI check](beta-ui-check-0.2.6.json).
