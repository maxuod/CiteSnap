# Privacy / 隐私说明

AnswerPouch keeps questions, task checkpoints, captures, UI preferences and dedicated browser login profiles locally. No getaudit account, cloud evidence uploader, analytics SDK or automatic collection schedule is included.

macOS data normally lives under `~/Library/Application Support/AnswerPouch/`: `workspace/` holds questions/evidence; `profiles/chrome-for-testing/` holds sensitive dedicated login stores; `runtime/` holds the explicitly downloaded browser and version/hash receipt. Native save/export dialogs write additional files where you choose.

| Action | External contact |
| --- | --- |
| App startup, freeze/import, language change, saved evidence/export | No question submission or AnswerPouch cloud upload |
| Explicit Prepare browser | Pinned archive from storage.googleapis.com; Google receives normal download metadata including network IP. No questions or login secrets are attached by AnswerPouch |
| Open/restore account | The platform and its sign-in services receive normal browser traffic |
| Explicit Start collecting | Exact frozen questions go through selected platform websites under your accounts |
| Click a citation | Saved URL opens in your system browser |

Third-party browser, platform and OS services may make their own requests and keep their own history/diagnostics under their terms. Local storage does not mean offline AI or anonymous use. Exports can contain private customer answers and URLs; they do not intentionally export cookies or login stores.

Removing the app from Applications does not erase local data. To remove everything, export evidence you need, normally quit, then inspect **only** the AnswerPouch data directory with Finder → Go → Go to Folder before deleting it. This permanently removes unexported evidence and local login sessions. Do not remove other products' folders.

中文：问题、证据、独立账号资料和下载的浏览器分别存在本机 AnswerPouch 目录。准备浏览器连接 Google，登录连接所选平台，开始采集才提交冻结问题；引用通过系统浏览器打开。第三方服务有各自网络与隐私行为，本地不等于离线或匿名。卸载应用不会自动删除数据；如需清除，先导出资料、退出，再仅处理本应用的数据目录。不要公开 Cookie、账号资料、密钥或客户原始导出。
