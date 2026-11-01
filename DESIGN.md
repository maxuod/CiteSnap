---
name: CiteSnap desktop
description: Warm local workspaces for questions, account readiness and original AI evidence.
colors:
  primary: "#c74818"
  brand-orange: "#eb632c"
  primary-hover: "#ad3910"
  tint: "#fff0e5"
  paper: "#fffaf6"
  surface: "#ffffff"
  ink: "#26231f"
  muted: "#6b6058"
  line: "#e6dcd4"
  input-border: "#baaa9c"
  hover-border: "#dcb798"
  import-border: "#c8b6a7"
  source-divider: "#eee7e1"
  positive: "#276641"
  negative: "#a62f26"
  attention: "#8c570b"
  notice-surface: "#fff0e6"
  notice-border: "#e6c0a5"
  notice-ink: "#753b1a"
  error-surface: "#fff0ed"
  error-border: "#e8b8b2"
  success-surface: "#eef7ef"
  success-border: "#c7ddc8"
  risk-ink: "#754614"
  risk-surface: "#fff0d5"
  risk-border: "#d8b36e"
  table-head: "#fff1e5"
  table-divider: "#eee5dd"
typography:
  display:
    fontFamily: "Bricolage, 'PingFang SC', sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  brand:
    fontFamily: "Bricolage, sans-serif"
    fontSize: "25px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.6
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.5
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
  status:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.5
  evidence:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.8
rounded:
  control: "8px"
  quiet-hover: "7px"
  notice: "10px"
  panel: "14px"
  circle: "50%"
spacing:
  compact: "6px"
  small: "8px"
  control-gap: "9px"
  medium: "12px"
  regular: "16px"
  panel: "20px"
  large: "24px"
  section: "27px"
  column: "28px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  button-secondary-hover:
    backgroundColor: "{colors.tint}"
  button-stop:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.negative}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "6px 9px"
  button-quiet-hover:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.primary}"
    rounded: "{rounded.quiet-hover}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    width: "100%"
  import-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "18px"
  network-card:
    backgroundColor: "{colors.tint}"
    rounded: "{rounded.panel}"
    padding: "19px"
  notice:
    backgroundColor: "{colors.notice-surface}"
    textColor: "{colors.notice-ink}"
    rounded: "{rounded.notice}"
    padding: "12px 16px"
  notice-error:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.negative}"
  notice-success:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.positive}"
  evidence-reader:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "20px"
  status-positive:
    textColor: "{colors.positive}"
    typography: "{typography.status}"
  status-attention:
    textColor: "{colors.attention}"
    typography: "{typography.status}"
  status-negative:
    textColor: "{colors.negative}"
    typography: "{typography.status}"
---

# Design System: CiteSnap desktop

## Overview

**Creative North Star: "A warm local evidence workspace"**

This is a descriptive name for the accepted implementation, not a new visual-world proposal. CiteSnap uses the approved warm orange/white palette: an owned mouthless mascot, weighty Bricolage brand lettering, warm paper and white work surfaces. Its personality is lightly playful in the identity and restrained in the working content. The system remains a desktop workspace with generous separation between task groups, compact source rows and dense evidence when there is evidence to read.

The visual hierarchy makes the current action and its state legible. Borders, surface tone, readable labels and explicit status text do the work; color alone does not establish readiness or completion. Original answers keep a reading voice rather than becoming code blocks or promotional summaries. English and Chinese share the same structure, with system fonts carrying working text and Chinese glyphs.

**Key Characteristics:**

- Warm paper surrounds white work areas and a single orange action family.
- A mouthless owned mascot and Bricolage lettering carry the playful identity.
- Rounded controls, fine borders and generous task-group gaps create a calm working rhythm.
- Dense source rows and evidence remain readable through wrapping and contained scrolling.
- State is expressed in words as well as color, with visible keyboard focus and bounded motion.

The frontmatter records the actual desktop CSS. In particular, the darker functional orange and implemented tint are authoritative here; the surface brief's brighter orange and pale-orange description remain direction context. The brief's three-step composition belongs in [docs/desktop-surface.md](docs/desktop-surface.md), and product/release truth belongs in [PRODUCT.md](PRODUCT.md). This file does not expand their claims.

## Colors

The palette is warm paper and ink with orange actions, supported by muted semantic greens, reds and amber for observed state.

### Primary

- **Working Orange** (primary): enabled primary actions, keyboard focus, checkbox accents, caret and citation actions. Its deeper hover variant preserves the same action family.
- **Bright Brand Orange** (brand-orange): retained identity color from the approved world and declared source token; it is not the primary button fill in this desktop implementation.
- **Apricot Tint** (tint): numbered steps, quiet-action hover and the computer-network notice.

### Neutral

- **Warm Paper** (paper): the application canvas, including its visible gutters.
- **White Work Surface** (surface): inputs, imported-question panels, results tables and expanded evidence.
- **Dark Ink** (ink): working text, source names and headings.
- **Warm Muted Ink** (muted): helper copy, hashes, secondary metadata and footer guidance.
- **Warm Rule** (line): header/section separation and principal panel outlines. Input, hover, import and source-divider tokens retain their distinct border roles.
- **Pale Table Head** (table-head): sticky column headings; table-divider separates captured tasks.

The positive, negative and attention colors are semantic state colors, not additional brand accents. Feedback notices pair their corresponding text, surface and border. The stronger risk notice has its own amber-tinted surface and border. Keep all status words visible; a green word does not substitute for the actual underlying confirmation.

**The Evidence State Rule.** Preserve a written state beside every semantic color. Saved login, confirmed account, captured answer, incomplete citation coverage and stopped work must remain visually distinguishable by text.

## Typography

**Display Font:** locally bundled Bricolage at its shipped heavy weight, with system Chinese/sans-serif fallbacks.

**Body Font:** the platform system stack, including PingFang SC and Microsoft YaHei for Chinese.

The brand and main heading provide the expressive weight. Working labels and original answers use familiar system text. The scale is an observed set of roles rather than a mathematical ratio.

- **Display:** main heading; reduces to the source's compact size (25px) at the narrow breakpoint.
- **Brand:** compact wordmark alongside the decorative mascot; the small descriptive brand note uses system text.
- **Headline / Title:** section headings and panel headings; browser heading defaults supply the bold weight where CSS only sets size and line height.
- **Body / Label:** working copy and controls; source-name labels retain a semibold emphasis.
- **Caption / Status:** help, local metadata and compact source/task states. A status is plain text, not a pill.
- **Evidence:** proportional system text with a spacious line height. Preserve line breaks, wrap long content and keep code-like original text readable as literal evidence.

**The Original Voice Rule.** The evidence reader preserves the answer's original text and line breaks. Do not restyle it as a monospace console, silently shorten it or translate it when the interface language changes.

## Layout

The current desktop shell centers a fluid working column with an outer cap (1240px) and wide inline padding (38px). The header aligns the brand left and language action right. Sections use a narrow step rail (40px) beside a flexible content area, separated by a gap (16px) and warm horizontal rules. The two working columns are equal-width with a generous gutter (28px). Section padding supplies the repeated vertical rhythm (27px).

At the medium breakpoint (900px), shell padding tightens (20px 24px 40px), the column gutter reduces (18px), the small brand descriptor hides, source controls compact and the network definition list stacks. At the narrow breakpoint (700px), work columns become one column, the step rail and marker shrink, results/run controls stack and shell padding becomes uniform (18px). This documents source behavior; the accepted native capture sizes were wide (1180px) and compact (860px), not a mobile-distribution claim.

Keep content inside its own reading/scroll region. Question previews wrap and scroll within their bounded list (112px maximum height). The results table scrolls within a bounded area (450px maximum height), with sticky column headings and two-line question previews. The original evidence reader wraps long text and scrolls within its own maximum height (380px). Long hashes and citation URLs wrap rather than pushing the shell wider.

The language action translates local controls independently of the displayed host locale/timezone. It must not look like a country, network or location selector. Preserve the host-network note's explanatory hierarchy and unknown/unverified state.

## Elevation & Depth

The system is flat: the desktop CSS defines no box shadows, blur or gradient depth. Warm paper, white panels, pale-orange context surfaces and fine rules distinguish regions. Dash-to-solid borders communicate import state. Focus is an explicit outline, not a simulated shadow.

**The Flat Workspace Rule.** Extend the existing tonal and border hierarchy. Do not add floating shadows or glass to make ordinary controls and evidence feel important.

## Shapes

Controls have gently rounded corners (control); larger import, network, empty-state and evidence panels use the broader panel radius. Feedback and strong-risk messages use the intermediate notice radius. Numbered steps are circles, with a compact variant at the narrow breakpoint. Quiet actions only gain a filled rounded shape on hover.

The mascot is the unchanged owned mouthless getaudit/MAXUOD asset. Keep its silhouette and face intact; do not add a mouth, redraw it as an icon font or generate a substitute. Asset origin and font/icon provenance live in [desktop/assets/PROVENANCE.md](desktop/assets/PROVENANCE.md).

## Components

### Buttons

Buttons are compact, semibold and gently rounded. The primary button is Working Orange with white text and a darker hover. Secondary buttons are white with Warm Rule borders; hover uses Apricot Tint and the warmer hover border. The stop variant retains a white surface with negative text and a dedicated soft-red border. Small source/table actions reduce typography and padding. Quiet actions are text-like until hovered.

Every keyboard-operable button, field, select and link receives the source outline (3px solid Working Orange, offset 4px). Disabled buttons retain their layout with reduced opacity (0.5) and a not-allowed cursor; they must not be mistaken for enabled steps. There is no source transform or animated transition on button hover.

### Inputs / Fields

Inputs and selects use white surfaces, a single warm border and the control radius. Labels remain explicit. The draft textarea resizes vertically and has a useful starting height (133px minimum). Use the shared keyboard outline rather than inventing a separate glow. Source and acknowledgement checkboxes retain native interaction with the orange accent.

### Cards / Containers

The import panel has a dashed border while empty, becoming solid after a frozen set is imported; its shape, white surface and padding remain stable. The network notice uses Apricot Tint and stays a contextual aside beside sources in the wide layout. Empty results use a centered dashed white panel. Evidence is a white, solid-bordered reading panel. None is elevated with a shadow.

### Source Rows and Status

Each source row aligns a native checkbox, a flexible source-name/status column and compact account/check actions. Fine warm rules separate rows. Status is small semibold text with positive, attention or negative color; it is not an invented badge. Account saved and account confirmed remain different states, with the former still asking for a check.

### Feedback and Risk

Feedback notices use warm, error or success pairings with matching soft borders. Errors announce through the alert role; success and run state use status semantics. The repeated/high-frequency warning becomes a stronger amber-tinted panel. Keep acknowledgement checkboxes adjacent to their complete explanatory copy, with space for wrapping in both languages.

### Results and Original Evidence

Results use a white table with warm sticky headings, compact cells and readable state words. A task's evidence action opens the reading panel below the table. Opening evidence moves keyboard focus to the evidence heading; closing it returns focus to the originating task action. State refreshes and language changes preserve the active control and text selection where applicable.

The evidence panel includes the original frozen question, source/time/model metadata, any exclusion or stop reason, original answer, captured citation links, citation completeness wording and the evidence hash. Preserve this hierarchy. Visible two-line table previews never replace the complete original text available in the reader/export.

### Header and Activity

The header is a compact identity strip with one local-language action; there is no route navigation system to invent. The mascot alone bounces during actual active collection (1.6 seconds with the source easing). Idle and completed work stop the animation. Reduced-motion preference disables animation and uses automatic rather than animated scrolling. Do not add perpetual mascot movement or a loading animation to saved evidence.

## Do's and Don'ts

### Do:

- **Do** preserve the owned mouthless mascot, local Bricolage brand face and warm paper/white working surfaces.
- **Do** use the functional orange for actions and focus, keeping semantic status wording visible beside color.
- **Do** retain generous section gaps while allowing source rows and original evidence to be appropriately dense.
- **Do** wrap hashes, original answers and URLs, and contain long previews/evidence within their source scroll regions.
- **Do** keep focus visible and preserve the evidence open/close keyboard handoff through state refreshes.
- **Do** honor reduced motion and animate the mascot only while collection is actually active.
- **Do** keep Chinese and English controls structurally equivalent, independent of the host locale, network and original evidence language.

### Don't:

- **Don't** replace the mouthless mascot, add a mouth or treat asset reuse as a generated-image claim.
- **Don't** add shadows, glass, gradients or decorative dashboard cards to this flat working system.
- **Don't** present saved login as confirmed access or color alone as proof of a complete answer or citation set.
- **Don't** truncate or translate original evidence in the reader when changing interface language.
- **Don't** style the language switch as a country, proxy, location or network control.
- **Don't** populate the customer starting state with the synthetic evidence used in visual acceptance captures.
