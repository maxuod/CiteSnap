# AnswerPouch customer experience

AnswerPouch · 答袋 is the provisional name for a standalone local AI answer/citation collector for SEO/GEO researchers, separate from the getaudit hosted website, GSC accounts, analysis and recommendations. Ordinary customers should download/open the application without installing Node.js, running commands, editing config files or obtaining developer keys. Their own platform sign-in is required; a getaudit account is not.

## Confirmed workflow

1. Freeze exact local questions to a file, one question per line, with their wording, order and integrity hash.
2. Import that file. Integrity is checked and a local copy saved. Import does not send questions.
3. Select sources, sign into the user's own accounts in dedicated windows, review account/request and local-network notices, then Start. Collect automatically and sequentially; inspect/export original answers, links and stopped tasks.

Adapters: ChatGPT Search, Gemini, Copilot, Perplexity, Grok and Google AI Overview. Availability is not proof of account access, complete answers or full citations. The shipped app starts empty; synthetic fixtures are test-only.

## Account, frequency and location

Dedicated profiles remain separate from personal Chrome and getaudit. Saved login is not current account proof. No automatic startup login window/collection, paid/API fallback, retry or interrupted-submission replay. CAPTCHA, login expiry, rate limits or region restrictions stop the batch and retain evidence.

Frequent/large automated requests may cause verification, rate limits, temporary restrictions or account suspension. Larger/repeated batches show a stronger warning, and repeats require an extra acknowledgement. Initial local guard: 50 starts/source in a rolling 24 hours, one at a time, with a 45-second gap. These are local guardrails, not platform-approved safe quotas or an account-safety guarantee.

Use the host's actual network and browser defaults. No app controls or start-input overrides for country, proxy, IP, timezone or geolocation. UI language only translates local controls. System VPN/proxy settings can affect the exit; the app does not adjust them. Network country and physical location remain unverified; results/access may be region-limited.

## Implemented local candidate and remaining release work

Version 0.2.0 implements this flow in Electron with its own pinned Chrome for Testing runtime. Initial target: Apple Silicon macOS 13 or newer. Default English plus Chinese. Preserve the orange/white world and mouthless mascot; docs/desktop-surface.md records the direction.

Source tests and native synthetic acceptance are recorded in docs/. Local certificate signing and bundled-browser smoke have separate receipts. Local signing is not Developer ID, Apple notarization, clean-machine acceptance or a public customer download. Real sign-in/capture per platform and clean-Mac installation remain to be accepted. Do not claim Windows or Intel support.

The free/open-source research-core direction is unchanged; extraction does not enact a new license or public release. Browser extensions and hosted model APIs remain alternatives with different permissions/evidence conditions; neither has been implemented as an equivalent replacement here.
