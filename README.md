# CiteSnap

Check how AI mentions a company, website or product.

CiteSnap is free script-based software for GEO/AEO optimization. Import a frozen question set, sign into your own accounts and choose AI platforms. It automatically submits the questions and collects the answers with their cited links.

Use the same questions to examine mentions of a target company, website or product alongside competing alternatives. Reviewing what gets mentioned and which pages are cited can reveal gaps to address in your content and GEO/AEO work, with the aim of gaining more mentions than competitors.

[Download the Mac beta](https://github.com/maxuod/CiteSnap/releases/tag/v0.2.4-beta.1) · [Install and sign in](docs/INSTALL.md) · [简体中文](#中文)

## Try the beta

The current build is **CiteSnap 0.2.4 beta**. Quit the earlier app normally before opening the update. Upgrades keep the existing AnswerPouch data directory so saved questions, evidence and dedicated profiles remain in place.

| Build | Requirements | Status |
| --- | --- | --- |
| [0.2.4 beta 1 — DMG](https://github.com/maxuod/CiteSnap/releases/download/v0.2.4-beta.1/CiteSnap-0.2.4-mac-arm64-beta.dmg) | Apple Silicon (M1+), macOS 13+ | Public beta; no Apple Developer ID/notarization |
| Intel Mac / Windows / Linux | — | No supported installer in this release |

It runs on Apple Silicon Macs (M1 or newer) with macOS 13+. Intel Mac, Windows and Linux installers are not available. Download the DMG from the release page and drag the app into Applications.

This beta has a local build signature and has not received Apple Developer ID signing or notarization. macOS may ask you to approve opening it in Privacy & Security. Read the [installation guide](docs/INSTALL.md) and [Apple's explanation](https://support.apple.com/en-us/102445) before proceeding. Installation after an internet download on another clean Mac remains untested.

On first use, click Prepare browser to download the collection browser directly from Google, about 183 MB. The app checks a pinned SHA-256 before installing it locally. You can use the desktop download without Node.js, terminal commands, an API key or a getaudit account.

## Collect a first answer

1. Enter your questions, one per line, and choose Freeze & save. The saved file records their wording and order with an integrity hash.
2. Import that file. You can keep it for a later observation using the same questions.
3. Prepare the browser, select a source and open its account window. Complete your own sign-in, then return to the app and wait for Account confirmed. Use Check if needed.
4. Review the planned requests and account/network notices, acknowledge them, then choose Start collecting.
5. Open a result to read the original captured answer and follow its saved citations. Export evidence saves the question set, task results and capture records as JSON.

For the first run, start with one question and Copilot. Importing questions, signing in or viewing saved results does not start collection.

Start with the questions where the target company, website or product appears, then compare the competitors named in those answers. Follow the citation links to inspect the source pages and the content they cover.

Mention assessment and competitor comparison currently depend on reviewing the saved answers. After making changes, you can import the same frozen file and explicitly authorize another observation, including the repeat-request acknowledgement. Keeping the questions fixed helps comparison; platform, account, time and network conditions can still change the result.

## What has been checked

| Adapter | Real-account acceptance |
| --- | --- |
| Copilot | One owner's login/restoration, automatic answer/citation capture and native export checked on 2026-10-31; final parser compared with the same native conversation |
| ChatGPT Search, Gemini, Perplexity, Grok, Google AI Overview | Adapters present; independent real-account collection not yet accepted |

One earlier Copilot capture retained 2,745 characters and six citation URLs. The final parser was checked against the same conversation. A separate extraction failure was retained and recovered manually without resending the question.

The 0.2.3 browser preparation and export checks used local or intercepted test pages. These checks do not establish that every platform or account works. The [validation record](docs/VALIDATION.md) brings together the [Copilot observations](docs/copilot-native-read-fix-2026-10-31.md) and [0.2.3 delivery checks](docs/beta-release-0.2.3.md).

## Accounts, network and evidence

Frequent or large automated batches can trigger verification, rate limits, temporary restrictions or account suspension. CiteSnap processes one request at a time with 45-second gaps and a local guard of 50 starts per source in a rolling 24 hours. These settings do not guarantee account safety. Access restrictions stop the batch; submitted tasks with an unknown result are kept without automatic replay.

Results depend on the platform, account and network region. The app uses this computer's current network and browser defaults, with no location or proxy controls. System VPN/proxy settings can affect the exit; the app does not verify physical location or network country.

Dedicated login profiles stay separate from your personal browser. The app has no evidence uploader or analytics SDK. Browser preparation contacts Google, and collecting sends the frozen questions to your selected platforms. Exported answers may contain private customer information. Read [Privacy](PRIVACY.md) before sharing them.

A missing capture does not show that the platform had no answer or sources. Hashes help detect changed files when compared with a trusted saved hash; they do not authenticate the platform's response.

## Development

The source is free under the [MIT license](LICENSE). Third-party software and the separately downloaded browser have their own [notices and terms](NOTICE.md). CiteSnap handles collection separately from getaudit's hosted analysis.

Development requires Node.js 22.19+:

```sh
npm ci
npm run check
npm test
npm run review:public
# Apple Silicon Mac development:
npm run prepare-browser
npm run desktop
```

See [Contributing](CONTRIBUTING.md), [Security](SECURITY.md) and [About the project](ABOUT.md). The [release procedure](docs/RELEASING.md), [local formats](docs/local-format.md), [legacy protocol](docs/protocol.md), [source provenance](source-provenance.json) and [changelog](CHANGELOG.md) cover development details. Report bugs with a redacted description and synthetic questions. Keep credentials, browser profiles and customer exports out of public issues.

The package setting `private: true` prevents accidental npm publication; it does not hide the public repository. Existing getaudit consumers remain pinned to the extracted 0.1.0 library until separately upgraded. CLI live guest collection is disabled; user collection goes through the desktop account and risk checks.

## 中文

[阅读中文 README](README.zh-CN.md)。
