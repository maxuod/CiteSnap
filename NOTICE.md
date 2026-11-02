# Source and delivery notice

CiteSnap uses the upstream getaudit MIT research-core license. Preserve the copyright notices in LICENSE. Runtime hashes and extraction context remain in source-provenance.json. No real profiles, customer answers or credentials belong in this repository.

Package private:true prevents npm publication, not public source availability. The original getaudit consumer stays pinned to 0.1.0. Public beta delivery is distinct from Apple Developer ID/notarization, independent-customer acceptance and a formal stable release.

## Third parties

- Electron 45.2.1: MIT, with Chromium/dependency notices in licenses/Electron-LICENSES.chromium.html.
- Playwright core 1.63.0: Apache-2.0; license/NOTICE retained under licenses/.
- Zod 4.6.7: MIT; retained under licenses/.
- Bricolage Grotesque font: SIL Open Font License, retained at desktop/assets/FONT-LICENSE.txt.
- CiteSnap's ghost icon is an original vector design; earlier MAXUOD/getaudit artwork remains in the repository. Provenance is recorded at desktop/assets/PROVENANCE.md. Source licensing does not grant a right to impersonate a product or imply endorsement.

Google Chrome for Testing is **not included in the distributed installer**. At the user's explicit Prepare browser action, the application downloads an exact pinned archive from Google's official host, subject to [Google browser terms](https://www.google.com/chrome/terms/) and its included component notices. Browser names/marks belong to their owners. The source MIT license does not relicense that external browser, Google components or other third-party software.

Existing evidence, extractor IDs, protocol kinds, bundle ID and on-disk data paths are retained for compatibility. Existing third-party license files are unchanged.
