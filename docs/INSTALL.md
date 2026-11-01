# Install AnswerPouch beta

[简体中文](#中文安装与首次登录) · [Download beta](https://github.com/maxuod/answerpouch/releases/tag/v0.2.3-beta.1)

## Requirements

An **Apple Silicon Mac (M1 or newer), macOS 13+**, an internet connection, and your own account for each selected AI platform. Allow roughly 1.5 GB of free space for the app, browser preparation and local evidence. Intel Macs, Windows and Linux do not have a supported installer in this beta. Internet access and platform availability depend on your network region.

No getaudit/GitHub account, Node.js, terminal commands, developer API key or Google Cloud project is required to use the download. The GitHub **Source code** ZIP is for developers; download the **mac-arm64-beta.dmg** application instead.

## Install and the macOS messages

1. Download **AnswerPouch-0.2.3-mac-arm64-beta.dmg** from this repository's release page.
2. Open the DMG and drag **AnswerPouch** into **Applications**. Eject the DMG, then open AnswerPouch from Applications.
3. This beta has a local build signature, **not an Apple Developer ID signature or notarization**. macOS may say it cannot verify the developer or check the app for malicious software. That message is expected for this distribution status; it does not establish that the app is safe.
4. Only if you trust this source and intended to install it, first attempt to open the app, then use **System Settings → Privacy & Security → Open Anyway**, and confirm **Open**. macOS may request your normal device authentication; complete that yourself. See [Apple's official explanation](https://support.apple.com/en-us/102445). Availability and wording vary by macOS version and managed-device policy.

If macOS reports that the app **will damage your computer**, that it is **damaged**, or your organization disallows opening it, stop and report the exact message. Do not disable Gatekeeper, remove quarantine attributes or change system trust. This beta has not been tested as an internet download on another clean Mac; the documented exception is not a guarantee that every Mac can open it.

## First preparation and sign-in

1. Launch AnswerPouch. It opens an empty local workspace. Use **中 / EN** at the top right to change the interface language.
2. Enter a name and your research questions, **one per line**. Click **Freeze & save**, choose a location for the frozen file, then **Import this set** (or **Import frozen questions** for a file you already saved). Import checks the exact wording, order and integrity hash. It sends no questions.
3. In **Choose sources & sign in**, click **Prepare browser** once. The app downloads about **183 MB directly from Google's official Chrome for Testing address**, verifies a pinned SHA-256, then installs it only in AnswerPouch's local data folder. [Google's terms](https://www.google.com/chrome/terms/) apply to that browser. Preparing it does not log in, send questions or start collection. If preparation fails, the app reports it; retry only by clicking the button yourself.
4. Select one source to start with; **Copilot has completed the limited real-account acceptance described below**. Click **Open account** beside the source. Complete sign-in, any account choice, two-factor check or verification **yourself in that platform's dedicated browser window**. AnswerPouch never asks for your account password in its own interface.
5. Return to AnswerPouch. It checks the eligible login window on return. If the status is still unconfirmed, use **Check** beside that source after completing sign-in. Wait for **Account confirmed**. A saved profile or absence of a Sign in button alone is not confirmation. Use the same steps for other selected sources. A login failure or regional/access restriction may prevent that source from working; do not bypass it.
6. Review **planned requests = frozen questions × selected sources**, the account-risk notice and the computer-network notice. Acknowledge both, then explicitly click **Start collecting**. Merely logging in does not start the run. For the first test, use **one question and one source**.
7. In **Answers & evidence**, use **View evidence** to inspect the original answer, captured citation URLs, completeness status and SHA-256. Citation buttons open only the saved URL in your system browser. Use **Export evidence** to save a JSON file containing the frozen questions, task results and original captured evidence. Treat that file as potentially private customer content.

On a later visit, **Restore login** opens the app's saved dedicated profile. Current account proof is checked again. Sessions can expire; no cross-platform or permanent sign-in guarantee is made. AnswerPouch does not copy your personal Chrome profile or getaudit login data.

## Limits and troubleshooting

- **Account risk:** frequent or large automated requests can cause verification, rate limits, temporary restrictions or account suspension. One request at a time, 45-second gaps and the local 50-start/source/rolling-24-hour guard are not platform-approved safe quotas.
- **Network:** the app uses the host computer's current connection and browser defaults. It has no country, proxy, IP, timezone or geolocation switch. OS VPN/proxy settings may affect your exit. Physical location and network country are unverified; results can be region-limited.
- **Stopped/unknown tasks:** access restrictions stop the batch. A submitted-but-uncertain task is not automatically retried. Preserve its record and inspect the platform conversation before authorizing any new observation. A missed capture does not prove that no answer or citation exists.
- **Browser preparation fails:** check available space and whether your network can reach Google's download host, then click Prepare browser again. Do not bypass network/organization restrictions. Report a verification error rather than using an unverified download.
- **Account stays unconfirmed:** finish sign-in in the window opened by this app; return and use Check. Do not use a separate personal-browser tab as proof. Some platform/account surfaces are not yet compatible.
- **Nothing sends:** import a frozen set, prepare the browser, select sources, confirm each account and acknowledge the notices. A local guard or platform restriction may still block starting.

Acceptance: one owner's Copilot sign-in/restoration, a real automatic capture and native export were checked on 2026-10-31. The successful capture retained **2,745 characters and six citation URLs**, independently matched to the same native conversation. A first extraction failure remains preserved; its answer was recovered manually without resubmission. This is not acceptance for all adapters or all customers. Version 0.2.3 adds first-use browser preparation; its automated/local acceptance is reported separately from that earlier real capture.

For a bug, use [GitHub Issues](https://github.com/maxuod/answerpouch/issues/new/choose), with your version, macOS version, chip, source and a redacted description. **Do not attach real profiles, cookies, passwords, tokens or unredacted customer exports.** See [Privacy](../PRIVACY.md).

## 中文安装与首次登录

### 适用电脑

**Apple Silicon Mac（M1 及更新芯片），macOS 13 或以上**；需要联网并使用各平台自己的账号。建议预留约 1.5 GB 空间供应用、浏览器准备和本地证据使用。本次没有 Intel Mac、Windows 或 Linux 安装包。无需注册 getaudit 或 GitHub 账号，无需 Node、终端命令、API 密钥或 Google Cloud 项目。

### 安装提示

1. 从本仓库的[测试版发布页](https://github.com/maxuod/answerpouch/releases/tag/v0.2.3-beta.1)下载 **AnswerPouch-0.2.3-mac-arm64-beta.dmg**，不要下载给开发者用的 Source code。
2. 打开 DMG，把 **AnswerPouch** 拖入 **Applications（应用程序）**，推出安装镜像，再从应用程序打开。
3. 本包有本地构建签名，但**尚无 Apple Developer ID 正式签名和公证**，可能出现“无法验证开发者”或“Apple 无法检查是否包含恶意软件”的提示。这符合当前发布状态，但不等于安全保证。
4. 只有在确认来源可信、确实要安装时，先尝试打开一次，再到 **系统设置 → 隐私与安全性 → 仍要打开／强制打开（Open Anyway）**，并在后续提示中确认打开。若系统要求本机密码或 Touch ID，由你自己完成。参见 [Apple 官方说明](https://support.apple.com/zh-cn/102445)。不同系统、组织管理策略可能有差异。

若提示**“会损坏电脑”**、**“已损坏”**，或组织策略不允许打开，请停止并反馈原提示。不要关闭 Gatekeeper、删除隔离属性或修改系统信任。本次尚未在另一台干净 Mac 上完成互联网下载后的安装验收，不能保证每台 Mac 都可通过手动确认打开。

### 首次使用，按这个顺序

1. 打开软件；新用户是空白工作区，右上角 **中 / EN** 切换语言。
2. 填问题集名称，**每行一个问题**，点击 **冻结并保存**；保存后点击 **导入这个问题集**。已有冻结文件可用 **导入冻结问题**。程序核对原文、顺序和哈希，导入不会发送问题。
3. 在第二步点击 **准备采集浏览器**。只需一次，程序从 **Google 官方地址下载约 183 MB**，核对固定哈希后保存在 AnswerPouch 自己的数据目录，适用 [Google 条款](https://www.google.com/chrome/terms/)。不需要另装浏览器或运行命令，准备过程不会登录或提问。
4. 初次先选 **一个来源**，建议从有实测记录的 Copilot 开始。点击该来源旁的 **打开账号窗口**，在软件打开的独立平台窗口内，**自己完成账号登录、二次验证或验证码**。不要把密码输入 AnswerPouch 自己的界面。
5. 回到 AnswerPouch，程序会检查刚才的登录窗口；仍未确认时，完成登录后点该行 **检查**，等到 **账号已确认**。其他勾选来源逐一照做。“登录已保存”还不等于当前账号已确认；平台限制或界面不兼容可能导致不能使用，不能绕过限制。
6. 核对计划请求数（**问题数 × 来源数**），阅读并勾选账号风险、本机网络说明，再点 **开始采集**。初次建议 **一个问题、一个来源**；登录或导入本身不会自动开始。
7. 到 **回答与原始证据 → 查看证据** 看原始回答、引用链接、完整性状态与哈希；点引用会用系统浏览器打开该已保存网址。点 **导出证据** 保存包含冻结问题、任务状态和原始证据的 JSON。导出可能含客户内容，分享前核对授权。

以后使用 **恢复登录** 打开此应用自己的已保存账号，仍会重新核实。登录可能过期，不保证一直有效。程序不会复制个人 Chrome 或 getaudit 的登录资料。

### 使用边界和常见问题

- **账号风险：**频繁、大量自动提问可能触发验证、限流、暂停或封号。顺序执行、45 秒间隔与每来源滚动 24 小时 50 次开始的本地限制，都不是安全次数保证。
- **地区限制：**只使用本机当前网络和浏览器默认环境，不提供国家、代理、IP、时区或定位切换。系统 VPN／代理可能影响出口；物理位置与网络国家未经核实。
- **中断：**访问受限会停止，已提交但结果未知不会自动重发。先保留记录并检查原对话；没抓到内容不等于平台没有回答或引用。
- **浏览器准备失败：**检查网络、磁盘空间及 Google 下载域名是否可访问，再自行点击准备重试。核验失败请反馈，不使用来源不明的浏览器，也不绕过组织限制。
- **账号未确认：**在本程序打开的平台窗口完成登录，回到应用点检查；其他个人浏览器标签的登录不算。部分平台或账号界面仍未兼容。

实测范围：2026-10-31 验证了一位用户的 Copilot 登录恢复、真实自动采集和原生导出；成功记录有 **2,745 字符正文、6 条引用网址**，与原对话核对一致。首条提取失败记录仍保留，原文从同一对话只读恢复，未重发。其他平台、其他用户仍需验收。0.2.3 的首次准备浏览器属于另行验证的新流程，不把之前的真实采集冒称为新版本的全平台认证。

反馈请用 [GitHub Issues](https://github.com/maxuod/answerpouch/issues/new/choose)，提供版本、系统、芯片、来源及脱敏描述。**不要上传账号资料、Cookie、密码、令牌或未经脱敏的客户证据。**
