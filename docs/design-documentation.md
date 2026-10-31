# Desktop design documentation receipt

This pass documents the accepted, code-led AnswerPouch desktop surface. It creates root DESIGN.md and .impeccable/design.json from desktop/style.css, desktop/index.html and desktop/app.js, using PRODUCT.md, docs/desktop-surface.md and desktop/assets/PROVENANCE.md for the already settled product and identity boundaries. No previous DESIGN.md or sidecar existed.

## Source observations

- Functional actions and focus use the implemented dark orange (#c74818); the brighter identity token (#eb632c) remains declared. The implemented tint (#fff0e5) differs from the direction brief's pale-orange swatch (#fff2e9). Documentation records the source rather than repairing that difference.
- There are no source shadows, gradients, blur effects or hover transitions. Source-row status is written colored text, not a pill/chip. No route navigation component exists.
- The desktop has two source breakpoints (900px and 700px). The native visual acceptance captures in the handoff cover 1180px and 860px; documenting the smaller source breakpoint does not claim a mobile release or additional native acceptance.
- The owned mouthless mascot, bundled Bricolage face and preserved macOS icon are reused assets. This pass generates no shipping raster.

## Scope of review

The parent handoff reports a full six-image finish review followed by a single-fix verdict of **ship** for keyboard continuity. This is a UI finding, not confirmation of real provider sign-in/capture, customer distribution or notarization. The documentation pass directly inspected the empty English and expanded Chinese evidence captures in addition to reading the runtime source. It did not re-run the detector or change UI/runtime/test files.

The six supplied captures are desktop-empty-en.png, desktop-imported-zh.png, desktop-compact-zh.png, desktop-evidence-zh.png, desktop-evidence-compact-zh.png and desktop-evidence-en.png under .impeccable/review/. Their records are synthetic QA evidence, not customer starting data.

## Structure and checks

DESIGN.md has normative YAML with 28 observed colors, nine typography roles, source-derived shape/spacing values and component variants, followed by the eight canonical sections in order. The sidecar has schemaVersion 2, metadata, source motion/breakpoints, an empty shadow vocabulary, ten self-contained component examples and narrative copied from DESIGN.md. Its eight-step OKLCH tonal ramps are synthesized swatch-display metadata; they do not define new application colors.

Checks passed for YAML/JSON parsing, allowed frontmatter/component properties, all token references, color presence in source, frontmatter/sidecar metadata correspondence, eight-step ramps, component reference resolution, scoped snippet classes, balanced snippet CSS blocks, keyboard-focus snippets and exact do/don't narrative mapping. No application tests were rerun for these documentation-only additions.

Documented source SHA-256 values:

- desktop/index.html: b214f8a5ee7fd4fedead137d14a307bb4e1cd40f5d52d0bfd9f19bffa66ac12b
- desktop/style.css: 1d5e4ea6089da5d738a1980c5f8f4a3e3ac272374d568d23b65caece0ef9a2ae
- desktop/app.js: 89268a516582fb47771cd5fbf38a154f31ad1abcfe288e212d463246f191d22e

Later UI edits require a source comparison before claiming these files still describe the accepted surface.
