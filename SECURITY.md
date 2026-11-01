# Security

The current beta receives fixes. It has not completed an independent security review, Apple Developer ID signing, notarization or installation acceptance on another clean Mac.

Report a suspected vulnerability through [GitHub private vulnerability reporting](https://github.com/maxuod/CiteSnap/security/advisories/new). Describe the affected version and a reproduction with synthetic data. Leave out credentials, cookies, account identities and customer exports. If the private route is unavailable, open a minimal issue asking for one without exposing the vulnerability.

## Boundaries to preserve

Dedicated profiles and positive account checks separate platform sessions from personal browser data. Frozen question hashes help detect edits before collection. Submission requires explicit account/network acknowledgements; uncertain tasks are not replayed automatically. The renderer is isolated, citation opening is limited to saved URLs, and the official browser download is pinned by version, size and SHA-256.

These checks do not establish platform approval, complete capture or freedom from vulnerabilities. Every Chromium launch must use `createBrowserEnvironment()` with only HOME, PATH, TMPDIR and LANG.

Keep system security controls in place. Do not disable Gatekeeper, strip quarantine attributes, change OS trust, bypass CAPTCHA or rotate identities after a restriction. Stop at unexpected damage/malware warnings. Password, two-factor and device authentication steps belong to the user.

## 中文

当前测试版接受修复，尚未完成独立安全审查、Apple 正式签名、公证或另一台干净 Mac 的安装验收。

漏洞请走 [GitHub 私密报告](https://github.com/maxuod/CiteSnap/security/advisories/new)，提供版本与合成数据复现，不附密码、Cookie、身份或客户导出。私密入口不可用时，先用公开 Issue 请求私密渠道，不披露漏洞细节。

请保留账号隔离、问题校验、明确授权和未知任务不重发等边界。不关闭系统保护、不清除隔离属性、不绕过验证码或访问限制。密码、二次验证和本机认证由用户自己完成。这些控制不代表平台背书、采集完整或没有漏洞。
