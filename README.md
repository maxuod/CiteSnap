# AnswerPouch · 答袋

Collect AI answers. Keep the sources.

AnswerPouch is a standalone local browser collector extracted from getaudit. It captures original AI answers, source citations and bounded artifacts with observed access/session/coverage conditions. It can be consumed by getaudit or another compatible program without a GEO database or Electron application.

**Delivery:** a local extraction with synthetic validation. The name is provisional. No public repository/package or new live-platform acceptance is implied.

## Start

Requires Node.js 22.19+ and standard Google Chrome installed on macOS. Browser platform availability and account restrictions can change.

```sh
npm ci
npm test
node bin/answerpouch.cjs doctor
node bin/answerpouch.cjs check-task examples/guest-task.json
```

`doctor`, `check-task`, help and offline verification do not open a browser or submit a question. To explicitly collect one question, inspect the task first, choose a fresh private output path and acknowledge transmission:

```sh
node bin/answerpouch.cjs collect --task examples/guest-task.json --output /private/new-capture.json --acknowledge-transfer
node bin/answerpouch.cjs verify /private/new-capture.json
```

Replace the illustrative output with a writable private location. Each invocation performs at most one question; access restrictions stop it. There is no automatic retry, visible fallback or paid/API fallback. The first CLI uses strict signed-out sessions; library integrations retain explicit dedicated-profile login operations.

## Library

```js
const {createCollector, createEvidence, verifyEvidence} = require('@maxuod/answerpouch');
const collector = createCollector(); // Does not launch a browser.
// An explicit caller can now collect a validated task and close in finally.
```

`createCollector()` retains getaudit's existing `BrowserCollector` behavior, including cancellation, guest checks, dedicated login preparation/verification and session cleanup. `createChromeCollector` is retained as a compatibility alias. The seven extracted runtime modules are exported individually for compatibility and focused tests. See [the evidence protocol](docs/protocol.md).

## Responsibilities

AnswerPouch owns browser interaction, platform extraction, dedicated profile lifecycle and raw capture. getaudit owns projects, question planning, persistent jobs/submission checkpoints, GSC, evidence quality assessment, brand/citation calculations, editing suggestions and reports. The two projects do not share a database. The hosted web app does not gain access to a local browser or its accounts through this extraction.

Only runtime source, schemas, types, this documentation and source-provenance metadata enter a package. Real profiles, credentials, SQLite files and customer captures stay outside the repository. [Source notice](NOTICE.md).

## 中文

AnswerPouch 暂称“答袋”：把 AI 原始回答、引用与采集条件放进一个可核验的证据袋。

这是独立的本地采集器项目，可以供 getaudit 或其他程序调用。GEO 分析、GSC、用户账号、数据库、任务调度与报告留在 getaudit。采集器保留现有访问停止、独立登录资料、最小浏览器环境和证据规则。

先运行测试与任务检查；只有明确执行 `collect` 并确认传输才会打开浏览器、向外部平台发送问题。当前命令行一次采集一个未登录问题，不自动重发、不绕过限制，也不调用付费接口。本次分离没有验证新的真实平台回答或实现云端远程采集。
