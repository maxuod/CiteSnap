# Install and sign in

[中文安装与首次登录](#中文安装与首次登录)

These instructions apply to CiteSnap 0.2.5 beta.

## Install on a Mac

You need an Apple Silicon Mac (M1 or newer), macOS 13+, an internet connection and your own account for the platform you want to use. Allow roughly 1.5 GB of free space for the application, browser preparation and evidence. This release has no Intel Mac, Windows or Linux installer.

1. Open the [beta release page](https://github.com/maxuod/CiteSnap/releases/tag/v0.2.5-beta.1) and download CiteSnap-0.2.5-mac-arm64-beta.dmg. GitHub's Source code ZIP is for developers.
2. If CiteSnap is already running, quit it normally before replacing the app. Open the DMG, drag CiteSnap into Applications and eject the image. Launch the copy in Applications.
3. The beta has a local build signature, without Apple Developer ID signing or notarization. You may see a message that the developer cannot be verified or Apple cannot check the app for malicious software.
4. If you trust the source and intended to install it, first attempt to open the app, then go to System Settings → Privacy & Security → Open Anyway and confirm Open. Complete any device password or Touch ID request yourself. [Apple explains this process here](https://support.apple.com/en-us/102445). Wording and availability depend on macOS and any organization policy.

If the message says the app will damage your computer or is damaged, stop and report the exact message. Keep Gatekeeper, quarantine attributes and system trust settings intact. Installation after an internet download on another clean Mac has not yet been tested; the steps above are not a guarantee that every Mac will accept this beta.

## Freeze questions and connect an account

1. Launch the app. Use 中 / EN at the top right if you want to change language.
2. Give the question set a name and enter one question per line. Choose Freeze & save, save the file, then choose Import this set. Use Import frozen questions for a file saved earlier. Import checks its wording, order and hash without sending questions.
3. Choose Prepare browser. This downloads about 183 MB from Google's official Chrome for Testing address, verifies the pinned SHA-256 and installs it in the app's data folder. [Google's terms](https://www.google.com/chrome/terms/) apply. Preparation does not sign in or submit questions. If it fails, check the message and retry only when you choose to.
4. Select one source and choose Open account beside it. Complete sign-in and any two-factor or verification steps yourself in that dedicated platform window. The collector's own interface does not ask for your platform password.
5. Return to the app and wait for Account confirmed. If it remains unconfirmed after signing in, choose Check beside that source. Another personal-browser tab is not proof that this profile is signed in. Repeat these steps for any other selected source.
6. Review the planned count, which is the number of frozen questions multiplied by selected sources. Read and acknowledge the account-risk and local-network notices, then choose Start collecting. For a first test, use one question and Copilot, the platform with a limited real-account validation record.

On a later visit, Restore login opens the app's saved dedicated profile. Its current account status is checked again. Sessions can expire; a saved login does not establish that the platform will accept another request.

## Inspect and export

Choose View evidence on a result to read the captured answer, citation URLs, coverage status and hash. Citation buttons open the saved address in your system browser. Export evidence writes a JSON file with the frozen questions, task states and original capture records to the location you choose.

Keep failed and uncertain records. A submitted task with an unknown result is not retried automatically; inspect the existing platform conversation before authorizing another observation. A missed capture does not establish that the platform had no answer or sources.

## When a step does not finish

| Step | What to check |
| --- | --- |
| Browser preparation | Available space, network access to Google's download host and the displayed error. Report a hash-verification failure; do not substitute an unverified browser. |
| Account confirmation | Finish sign-in in the window opened by this app, return and choose Check. Some account/platform interfaces remain incompatible. Stop at CAPTCHA, login expiry or access restrictions. |
| Starting a run | A frozen set is imported, the browser is ready, every selected account is confirmed and the notices are acknowledged. A local limit or platform restriction can still prevent collection. |
| Export | Choose a new filename if a file already exists. Exports may include customer content; check authorization before sharing. |

The [README](../README.md#accounts-network-and-evidence) covers account frequency and regional limits. See [Privacy](../PRIVACY.md), [validation scope](VALIDATION.md) and [bug reports](https://github.com/maxuod/CiteSnap/issues/new/choose). Send a redacted description with your version, macOS, chip and source; leave out cookies, profiles, passwords, keys and raw customer exports.

## 中文安装与首次登录

下列步骤对应 CiteSnap 0.2.5 测试版。

### 安装

需要 M1 及更新芯片的 Mac、macOS 13+、网络和自己的平台账号。建议预留约 1.5 GB 空间，供应用、浏览器准备和证据使用。本次没有 Intel Mac、Windows 或 Linux 安装包。

1. 到[测试版发布页](https://github.com/maxuod/CiteSnap/releases/tag/v0.2.5-beta.1)下载 CiteSnap-0.2.5-mac-arm64-beta.dmg。Source code 是开发者源码，普通使用请选 DMG。
2. 如果 CiteSnap 正在运行，替换应用前请先正常退出。打开镜像，把 CiteSnap 拖入 Applications（应用程序），推出镜像，再从应用程序打开。
3. 本包只有本地构建签名，未完成 Apple Developer ID 正式签名和公证，可能出现“无法验证开发者”或“Apple 无法检查是否包含恶意软件”的提示。
4. 确认来源可信且确实要安装时，先尝试打开一次，再到系统设置 → 隐私与安全性 → 仍要打开／强制打开（Open Anyway），在后续提示中确认打开。本机密码或 Touch ID 由你自己完成。[Apple 官方说明](https://support.apple.com/zh-cn/102445)介绍了这个过程，具体入口受系统版本和组织策略影响。

若提示“会损坏电脑”或“已损坏”，请停止并反馈原文。保留系统安全检查、隔离属性和信任设置，不通过关闭保护来安装。另一台干净 Mac 下载后的安装尚未验收，以上步骤不能保证每台电脑都能打开。

### 冻结问题并登录

1. 打开应用，右上角中 / EN 切换界面语言。
2. 填写问题集名称，每行一个问题，点击“冻结并保存”。保存后点“导入这个问题集”；已有文件则点“导入冻结问题”。导入会核对原文、顺序和哈希，不发送问题。
3. 点“准备采集浏览器”。程序从 Google 官方下载约 183 MB，核对固定哈希后保存在自己的数据目录，适用 [Google 条款](https://www.google.com/chrome/terms/)。准备过程不会登录或提问，失败后也不会自动重试。
4. 勾选一个来源，点该行“打开账号窗口”。在应用打开的独立平台窗口内，自己完成登录、二次验证或验证步骤；不要把平台密码填入采集器自己的界面。
5. 回到应用，等待“账号已确认”。完成登录后仍未确认，就点该行“检查”。个人浏览器里的另一标签不算当前独立账号的登录证明。其他选中来源逐一照做。
6. 核对计划请求数，也就是问题数乘以来源数，阅读并确认账号风险和本机网络说明，再点“开始采集”。第一次建议一个问题、一个 Copilot 来源。

以后点“恢复登录”会打开本应用保存的独立资料，并重新核实账号。登录可能过期，已保存不代表平台一定接受下一次请求。

### 查看结果与排查

在结果中点“查看证据”，可读到本次捕获的原始回答、引用网址、覆盖状态和哈希。引用按钮用系统浏览器打开已保存的网址；“导出证据”把冻结问题、任务状态和原始记录保存为 JSON。

浏览器准备失败时，检查空间、网络和 Google 下载域名是否可访问；哈希核验失败应反馈，不换用来源不明的文件。账号未确认时，在本应用打开的平台窗口完成登录后返回检查；部分界面尚未兼容，验证码、登录过期或访问限制都可能让流程停止。

保留失败和结果未知的记录。已提交的任务不会自动重发，先检查原对话再决定是否授权新的观测。没抓到内容不等于平台没有回答或引用。导出文件若已存在，请换一个文件名；分享前核对客户授权。

请求频率、地区和本机数据说明见[中文 README](../README.zh-CN.md#账号地区与证据)和[隐私说明](../PRIVACY.md)。[反馈问题](https://github.com/maxuod/CiteSnap/issues/new/choose)时提供版本、系统、芯片、来源及脱敏描述，不上传 Cookie、登录目录、密码、密钥或客户原始导出。
