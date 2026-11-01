# Contributing

Start an issue or pull request with the problem, affected platform/OS, expected behavior and the check you used. A small reproduction with synthetic questions is easier to review than a customer export.

Development requires Node.js 22.19+. Run `npm ci`, `npm run check`, `npm test` and `npm run review:public`. CI uses synthetic fixtures and does not sign into AI platforms. Optional Mac UI/browser checks are developer checks, not another customer's installation acceptance.

Keep customer questions and answers, profiles, cookies, keys, production configuration, databases and installers out of Git. Public issues should contain redacted descriptions. Release binaries are uploaded separately after authorization; see the [release procedure](https://github.com/maxuod/CiteSnap/blob/main/docs/RELEASING.md).

## Collection changes

Preserve captured bytes, source links, extractor identifiers and provenance. The existing evidence identifiers, including `answerpouch.questions`, `answerpouch.local-capture` and `answerpouch.run`, remain historical/compatibility identifiers when the display name changes. Existing getaudit consumers stay pinned to 0.1.0 until separately upgraded.

Every Chromium launch must pass `createBrowserEnvironment()` with only HOME, PATH, TMPDIR and LANG. Import, read, startup and language changes must not initiate collection or downloads. Keep the explicit account and risk checks, access stops and uncertain-submission records. Do not add paid fallback, personal-profile migration, automatic replay or location/proxy simulation to the desktop flow.

Source contributions use the MIT license. Preserve upstream and third-party notices; branding does not grant permission to impersonate a maintainer.

## 中文

反馈或 PR 请说明问题、平台／系统、预期表现和验证方式，用合成问题复现，不附客户原始导出。开发需 Node.js 22.19+，提交前运行上方检查；CI 不登录真实平台。

不把客户内容、账号资料、密钥、生产配置、数据库或安装包提交到 Git。修改采集时，保留原始证据、来源、历史标识和兼容字段，不增加自动重发、绕过限制、付费回退、个人资料迁移或位置模拟。界面改名不构成重写旧证据的理由，原许可证和第三方声明继续保留；getaudit 现有使用者仍固定在提取版 0.1.0，升级需另行处理。
