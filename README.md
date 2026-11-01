# AnswerPouch · 答袋

**Collect original AI answers. Keep their source evidence.**

Free, open-source local AI answer and citation collection for SEO/GEO researchers. Freeze exact questions, use your own platform accounts, and retain inspectable evidence on your computer. Independent of the getaudit hosted website.

**[Download Mac beta](https://github.com/maxuod/answerpouch/releases/tag/v0.2.3-beta.1)** · **[Install & first sign-in / 安装与首次登录](docs/INSTALL.md)** · [中文](#中文)

## Download

| Build | Requirements | Status |
| --- | --- | --- |
| [0.2.3 beta 1 — DMG](https://github.com/maxuod/answerpouch/releases/download/v0.2.3-beta.1/AnswerPouch-0.2.3-mac-arm64-beta.dmg) | Apple Silicon (M1+), macOS 13+ | Public beta; no Apple Developer ID/notarization |
| Intel Mac / Windows / Linux | — | No supported installer in this release |

Download the **DMG**, not the developer Source code ZIP. No Node.js, terminal, API key, GitHub account or getaudit account is needed. Starts empty. First use includes one explicit **Prepare browser** download (about 183 MB) directly from Google's official host, subject to Google's terms; the browser is not redistributed in our installer.

macOS may require individual approval in **System Settings → Privacy & Security → Open Anyway**. Only approve a source you trust and intended to install. Read the [installation messages and steps](docs/INSTALL.md) and [Apple's explanation](https://support.apple.com/en-us/102445). Another clean Mac's internet-download installation remains unverified. Signing/notarization is deferred; this beta does not promise frictionless installation.

## Use

1. **Freeze & save** exact local questions, one per line.
2. **Import** the frozen file. Wording, order and SHA-256 are checked; import sends no questions.
3. **Prepare browser** once, select sources and sign into **your own accounts** in dedicated windows. Return and wait for **Account confirmed**; use **Check** if needed.
4. Review request counts and acknowledge account/network risks, then explicitly **Start collecting**.
5. Inspect original answers, captured citation links, access/completeness conditions and hashes. **Export evidence** saves frozen questions, tasks and original capture records as JSON.

Orange/white UI, mouthless mascot, English default and Simplified Chinese. Sequential requests. Saved login is checked again; no automatic replay or paid API fallback.

## Platform validation

| Adapter | Real-account acceptance |
| --- | --- |
| Copilot | One owner's login/restoration, automatic answer/citation capture and native export checked on 2026-10-31; final parser compared with the same native conversation |
| ChatGPT Search, Gemini, Perplexity, Grok, Google AI Overview | Adapters present; independent real-account collection not yet accepted |

The successful automatic Copilot record retained **2,745 characters and six citation URLs**. A first extraction failure remains preserved; its existing answer was recovered manually without resubmission. Version 0.2.3 changes browser delivery; earlier real evidence does not certify this version for every account/platform. See [acceptance details](docs/copilot-native-read-fix-2026-10-31.md), [changelog](CHANGELOG.md) and [beta verification](docs/beta-release-0.2.3.md).

Missing captures do not prove that an answer, mention or citation was absent. Hashes detect changes relative to a trusted retained hash, not platform attestation. Finished processing does not guarantee complete answers/citations.

## Account, location and privacy

Frequent/large automated requests may trigger verification, rate limits, temporary restrictions or account suspension. **45-second gaps and the local 50-start/source/rolling-24-hour guard are not safe quotas.** Restrictions stop the batch. Submitted-but-unknown tasks stay uncertain and never automatically retry. Repeated observations need explicit acknowledgement.

Uses the host computer's current network/browser defaults. No app country, proxy, IP, timezone or geolocation switch. OS VPN/proxy settings can affect the exit; physical location/network country remain unverified. Results/access can be region-limited.

Questions, evidence and dedicated login profiles stay locally. Starting sends exact questions to selected external platforms; preparation contacts Google's download service; citation clicks contact the saved website. No AnswerPouch cloud uploader, analytics SDK or background collection. No copying personal Chrome/getaudit profiles. Browsers/platforms have their own network behavior. See [Privacy](PRIVACY.md) and [Security](SECURITY.md). Do not post cookies, keys, profiles or raw customer exports in Issues.

## Open source and development

[MIT licensed](LICENSE), continuing the upstream getaudit research-core license. Third-party packages, font, browser terms and branding have separate [notices](NOTICE.md). The hosted web project stays private and separate. Existing getaudit consumers remain pinned to extracted 0.1.0 until separately upgraded.

Development needs Node.js 22.19+:

```sh
npm ci
npm run check
npm test
npm run review:public
# Apple Silicon Mac development:
npm run prepare-browser
npm run desktop
```

See [Contributing](CONTRIBUTING.md), [release procedure](docs/RELEASING.md), [evidence formats](docs/local-format.md), [legacy protocol](docs/protocol.md) and [source provenance](source-provenance.json). Package `private: true` prevents accidental npm publication; it does not make GitHub private. CLI live guest collection is disabled; customer collection uses desktop account/risk gates.

## 中文

**答袋：冻结问题，用自己的账号采集 AI 原始回答，把引用和证据一起留在本机。**

**[下载测试版](https://github.com/maxuod/answerpouch/releases/tag/v0.2.3-beta.1)** · **[中文安装与首次登录](docs/INSTALL.md#中文安装与首次登录)**

当前支持 **M1 及更新芯片的 Mac、macOS 13+**，未完成 Apple 正式签名、公证，安装时可能需在系统“隐私与安全性”里单独确认。另一台干净 Mac 的下载安装仍待验收。用户无需注册 getaudit、安装 Node、敲命令或填 API 密钥。首次点“准备采集浏览器”会从 Google 官方下载约 183 MB，不在我们的安装包里转发。

**冻结并保存 → 导入 → 准备浏览器 → 勾选来源并登录自己的账号 → 确认风险 → 开始采集 → 查看、导出证据。** 保留橙白与无嘴小人，默认英文，可切中文。登录、导入、查看证据不自动提问。

已实测一位用户的 Copilot 登录恢复、真实自动采集与导出；成功记录有 2,745 字符正文、6 个引用。其他平台虽有适配器，仍待真实验收；新版本浏览器准备流程与旧版实测分开记录。大量自动请求有验证、限流、封号风险，软件间隔和本地限制不是安全次数。只用本机当前网络，不提供地区／代理切换，访问受限即停止，不自动重发。

源码免费开源（MIT），证据本地保存。分享导出前核对客户授权；反馈不要上传 Cookie、账号资料、密钥或未经脱敏的客户证据。
