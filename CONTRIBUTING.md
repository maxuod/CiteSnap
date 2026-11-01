# Contributing

Use Node.js 22.19+. Run `npm ci`, `npm run check`, `npm test`, `npm run review:public`. CI uses synthetic fixtures, never provider sign-in. Optional Mac UI/browser checks are local developer acceptance, not clean-customer installation proof.

Describe the concrete problem, resulting behavior, affected platform/OS and relevant verification in small issues/PRs. Use synthetic examples. Never commit real profiles, cookies, credentials, customer answers/questions, production config, databases, raw reports or installers. Binaries belong in an authorized release.

Preserve original captured evidence, extractor IDs and source provenance. No uncertain-submission retries, access bypass, paid fallback, personal-profile migration or desktop geographical/proxy simulation. Every Chromium launch must explicitly pass createBrowserEnvironment() with only HOME, PATH, TMPDIR and LANG. Startup/read/import/language changes must not initiate downloads or collection.

Source is MIT; preserve upstream and third-party notices. Branding does not permit impersonation. See [releasing](docs/RELEASING.md).

中文：欢迎可验证的小范围修复。用合成数据测试，不提交账号资料、客户内容、密钥、生产配置、数据库或安装包。保留历史证据，不增加自动重发、绕过限制或位置模拟。
