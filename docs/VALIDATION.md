# Beta validation

The observations below retain their original version scope. Tests using synthetic data are distinguished from real-platform observations.

## 0.2.6 beta checks

The source suite passed 239 tests, with one existing opt-in skip. The packaged application and source assets matched; isolated native checks covered the new icon, both interface languages, browser preparation failure and reuse, and preservation of a synthetic workspace. The installer was mounted read-only to verify the icon, guide, shortcut and local signature. No real AI-platform question was submitted. Apple Developer ID signing, notarization and installation on another clean Mac remain unverified.

0.2.6 测试版通过 239 项测试，另有一项原有可选跳过。隔离环境核对了新图标、中英文界面、浏览器准备及合成工作区的保留；安装包以只读方式检查。没有新发真实平台问题，Apple 正式签名、公证和另一台干净 Mac 的安装仍待验证。

## Real Copilot observations

Two distinct questions were submitted once each through one user's own Copilot account on 2026-10-31. The sequence matters:

| Version | What the check established |
| --- | --- |
| 0.2.0 | The first question reached Copilot, but extraction timed out. The failure was retained; the second task was held without submission. |
| Manual recovery | A read-only inspection of the first existing conversation recovered 3,835 normalized text characters and 21 citation URLs. No question was resent; full citation coverage was not confirmed. |
| 0.2.1 | The previously unsubmitted second question was frozen separately and sent once. Automatic collection and native export retained 2,745 characters and six citation URLs. All six addresses returned HTTP 200 at the check. |
| 0.2.2 | The final parser was compared with that same second conversation, without another submission. Its answer and URL-set hashes matched the export; six native citation cards matched the six URLs. Saved Copilot login was positively reconfirmed after normal reopening. |

The original failed and successful records were not rewritten. These checks cover this account and its observed conversations, not all users, indefinite login validity or every platform. The [dated technical record](https://github.com/maxuod/CiteSnap/blob/main/docs/copilot-native-read-fix-2026-10-31.md) preserves the version details.

## 0.2.3 delivery checks

The full source suite passed 233 tests, with one existing opt-in skip, across 10 files. Packaged source and licenses matched 280 bundle entries and 31 checked source/assets. Fresh-window UI, English/Chinese layout, explicit browser-download failure, no automatic retry, saved-workspace preservation and recognition of the prepared official browser were checked in isolated data folders.

The official browser archive's fixed size and SHA-256 were verified, followed by a browser launch against a local synthetic page. The packaged collector was also exercised against intercepted Gemini/Perplexity test pages: four successful captures, one restriction capture and one task held after that restriction. These tests sent no real questions to AI providers and used no customer accounts.

The DMG was verified and mounted read-only to check the app, local signature, Applications shortcut, installation guide and notices. A complete unauthenticated download from the public release matched the published hash. Release CI passed.

0.2.3 installer SHA-256: `9c23951714cd10353311142f468b46597050173c44e06423c35cf216eb17c05e`

See the [publication receipt](https://github.com/maxuod/CiteSnap/blob/main/docs/publication-0.2.3.json) and [0.2.3 check record](https://github.com/maxuod/CiteSnap/blob/main/docs/beta-release-0.2.3.md). The earlier real Copilot observations are separate from these delivery tests.

## Still unverified

Apple Developer ID signing and notarization are deferred. Installation after a download on another clean Mac has not been accepted. ChatGPT Search, Gemini, Perplexity, Grok and Google AI Overview still need real-account collection checks; having an adapter or passing intercepted tests does not establish their availability.

Captured content can be incomplete. A processing-complete status does not guarantee complete answers or citations, and file hashes do not establish platform authenticity.

## 中文核对说明

以下记录保留原始版本和验收范围，并区分模拟测试与真实平台观测。

真实平台部分，只验收过一位用户的 Copilot。两个不同问题各发送一次：第一个在 0.2.0 提取超时，之后从原对话只读恢复了 3,835 字符和 21 个引用网址，引用完整性未确认；第二个在 0.2.1 自动采集成功，保存了 2,745 字符和 6 个引用，6 个网址当时均返回 HTTP 200。0.2.2 最终解析器与第二段原对话核对，正文、网址集合哈希和 6 张原生引用卡片一致，未再提问。旧记录保持原样。

0.2.3 通过 233 项测试，另有一项原有可选跳过，共 10 个测试文件。浏览器准备、窗口交互、采集、访问受限后的停止和导出，使用隔离目录、本地页面及拦截的模拟平台页面验证，没有新发真实问题。安装包核对了 280 个文件清单条目和 31 个源码／资源文件，公开下载的完整文件与哈希一致，CI 通过。

这不等于新版本已通过所有真实账号的完整验收。另一台干净 Mac 的下载后安装、其他五个平台的真实账号采集仍待验证，Apple 正式签名与公证也尚未完成。回答、引用是否完整，仍需按每次记录的状态判断。

## 0.2.4 validation · 2026-11-01

The source suite passed 239 tests with one existing opt-in skip across 11 files. The signed local candidate matched 280 bundle entries and 32 checked source/assets. Its Info.plist reports CiteSnap / 0.2.4; the compatibility bundle identifier remains unchanged.

An isolated native cross-version check opened synthetic 0.2.3 records in 0.2.4. It retained Chinese, the frozen question hash, workspace/evidence bytes and the synthetic profile marker. The existing run export matched the old JSON, while the new default export filename began with CiteSnap. The test made no new real-platform request and did not verify the owner's actual login restoration. Default legacy data-path selection, explicit user-data overrides and rejection of linked roots also have focused tests.

Fresh-window, browser-preparation failure/reuse, localhost browser persistence and intercepted collection/export/restriction checks passed. The seven original browser collection modules are unchanged from the earlier validated parser revision. Historical real Copilot observations remain scoped to their original versions. Another clean Mac's installation and broader platform/account behavior remain unverified; Developer ID/notarization is still deferred.

See [upgrade receipt](rename-upgrade-check-0.2.4.json), [package receipt](packaged-check-0.2.4.json) and [native first-use receipt](beta-ui-check-0.2.4.json).

### 中文补充

0.2.4 通过 239 项测试，另有一项原有可选跳过，共 11 个测试文件。隔离的原生升级检查保留了旧版合成数据的中文偏好、冻结问题哈希、工作区与证据文件、合成资料标记，旧任务导出内容与原 JSON 一致，新导出文件名使用 CiteSnap。没有新发真实平台问题，也没有把合成资料检查说成用户真实登录恢复。

旧版真实 Copilot 记录仍保留原版本范围。其他电脑的安装、其他真实账号及平台行为尚待验证，Apple 正式签名和公证继续留待后续。
