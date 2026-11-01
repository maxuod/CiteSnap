# Privacy

CiteSnap's collection workflow keeps questions, task records, captured answers and dedicated platform profiles on your computer. It has no cloud evidence uploader, analytics SDK or automatic collection schedule.

On macOS, the application data folder contains:

- `workspace/` contains frozen questions, task checkpoints and evidence.
- `profiles/chrome-for-testing/` contains the dedicated login stores, which may hold sensitive cookies and sessions.
- `runtime/` contains the explicitly downloaded browser and its version/hash receipt.

Native save dialogs also write files to the locations you choose.

## Network activity

Opening the app, freezing or importing questions, changing the language and reading or exporting saved evidence do not submit questions. Prepare browser contacts Google's official download service, which receives normal request metadata such as your network IP. The app attaches no research questions or login secrets to that download.

Opening an account window contacts the selected platform and its sign-in services. Start collecting sends the exact frozen questions through the selected platform's website under your account. Clicking a saved citation opens its address in your system browser.

Browsers, platforms and the operating system may make their own requests or retain history and diagnostics under their terms. Local evidence storage does not mean offline AI or anonymous platform use.

## Sharing and removal

An evidence export can contain personal or customer information, answer text and URLs. It is not intended to include browser cookies or login stores. Check the file and the relevant authorization before sharing it. Keep profiles and account credentials private.

Removing the app from Applications leaves its data behind. If you also want to remove the data, first export what you need and quit the app. Identify its application data folder before deleting anything: removing it also deletes unexported evidence and local sessions.

## 中文

问题、任务记录、回答和独立平台登录资料保存在本机。程序没有证据上传、统计 SDK 或自动采集计划。

打开应用、冻结或导入、切换语言、查看及导出已有证据不会提交问题。“准备采集浏览器”连接 Google 官方下载服务；打开账号窗口会访问对应平台，点击“开始采集”才通过所选平台发送冻结问题。引用链接通过系统浏览器打开。浏览器、平台和系统有各自的网络及数据留存规则，本地保存不等于离线或匿名使用。

导出可能包含个人或客户信息、回答和网址，分享前请检查内容与授权。不要分享登录目录、Cookie 或密钥。卸载应用不会自动删数据；若需全部清除，先导出需要的资料、正常退出，确认本应用的数据目录后再删除。未单独导出的证据和本地登录也会一并移除。
