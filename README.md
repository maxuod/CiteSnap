# AnswerPouch · 答袋

Collect original AI answers. Keep their source evidence.

Independent local collector for SEO/GEO researchers, separated from getaudit. The 0.2.0 desktop candidate includes its own browser. Customers do not need Node.js, terminal commands, developer keys or JSON configuration. It starts empty, without a sample project.

## Customer flow

1. Paste questions and **Freeze & save** the local file.
2. **Import** the frozen file; exact wording/order and its hash are checked.
3. Select sources, sign into **your own accounts**, acknowledge the request/account and local-network notices, then **Start collecting**. Inspect original answers/citations and **Export evidence**.

Adapters cover ChatGPT Search, Gemini, Copilot, Perplexity, Grok and Google AI Overview. Real access, sign-in, complete answers and citations depend on the platform. This new desktop's real-provider acceptance remains unverified.

Frequent/large automated requests may trigger verification, rate limits, temporary restrictions or account suspension. Sequential requests, 45-second gaps and a conservative local daily guard do not establish safe usage. Restrictions stop the batch. Submitted-but-unknown tasks remain uncertain and never replay automatically. Repeated observations require a separate acknowledgement.

Collection uses the computer's actual network and browser defaults. There is no country, proxy, timezone or location switch. UI language does not simulate location. A system VPN/proxy can affect the exit; physical location and network country are unverified.

## Delivery

Local source/candidate only; no collector public repository/package, installer publication or deployment has occurred. Initial target: **Apple Silicon macOS 13 or newer**. A local certificate is not Developer ID or notarization. Official signing, Apple notarization, clean-Mac download acceptance and real platform sign-in/capture remain before claiming a frictionless public release. Windows/Intel support is not claimed.

The hosted [getaudit-web](https://github.com/maxuod/getaudit-web) project is private and separate. It cannot access local profiles. Existing installed getaudit 0.4.47 is untouched and its source remains pinned to the extracted 0.1.0 library; this desktop does not silently upgrade it.

## Data and evidence

The application stores questions/checkpoints/captures locally, with separate dedicated AI profiles. Import, saved evidence reading and UI language changes send no questions. This collector has no cloud upload. Questions are sent to the selected external platforms only when started. Opening a saved source link is an explicit action in the system browser.

Original question text/order, answer text, citations, bounded artifacts, timestamps and observed account/access conditions retain hashes. An account-unverified observed capture is retained but excluded from confirmed observations. Exports can contain customer content; share within its authorization. A hash detects changed bytes relative to a trusted retained hash; it is not platform attestation. See [local formats](docs/local-format.md), [legacy protocol](docs/protocol.md) and [delivery](docs/desktop-delivery.md).

## Development

Requires Node.js 22.19+ for development only. Install locked dependencies, run npm test, npm run prepare-browser and npm run desktop. Native isolated synthetic acceptance: node scripts/verify-desktop.mjs. Packaging: npm run package-desktop, with a configured signing identity; an existing private owner build config may be supplied using --local-signing-config and an absolute path. Never commit signing secrets.

Packaging uses a strict source/dependency allowlist. The library retains compatibility exports and separately records historical 0.1.0 versus current 0.2.0 hashes in source-provenance.json. CLI live guest collection is disabled in 0.2; offline verification remains. Customer collection goes through the desktop's frozen-question, own-account and host-network gates.

## 中文

答袋：**冻结问题 → 导入 → 勾选来源并登录自己的账号 → 自动采集 → 查看/导出原始回答与引用**。用户无需安装 Node、敲命令或配置开发者账号。

沿用橙白与无嘴小人，默认英文，可切换中文。只用本机当前网络，不提供地区/代理切换。请求过多可能触发验证、限流或封号，程序的请求间隔与每日限制不代表安全次数。中断或未确认结果不自动重发。

当前为 Apple Silicon Mac 本地测试版。独立平台登录实测、Apple 正式分发签名/公证及干净机器验收尚待完成，不能称为已公开可用的正式下载。
