# Capture evidence, version 1

`answerpouch.capture` retains the exact capture object and the requested task. The capture schema is extracted from getaudit's tested capture schema, independently of its ledger, quality assessment and reports. This package does not calculate brand mention or citation rates.

The envelope records collector version, extraction-manifest SHA-256 and a SHA-256 of recursively key-sorted JSON, excluding the envelope's own `hash`. Array order is retained. `verifyEvidence()` checks the schema, task/question binding and hash. It establishes consistency of saved content, not its truth, completeness or authenticity against a malicious writer.

Keep `observed`, `not_triggered`, `unavailable`, `error` and `cancelled` distinct. Access restrictions, uncertain account state, incomplete answers/citations and unverified geography remain evidence limits. An empty or blocked answer is never a zero brand-mention observation. Original answer wording, citations, artifact bytes, timestamps and extractor identifiers remain unchanged.

The first standalone CLI supports one explicitly acknowledged strict guest question per invocation, no paid APIs, no scheduled replay and no automatic fallback. The library retains the existing explicit dedicated-profile/session interface for getaudit compatibility. The CLI's strict guest task schema intentionally excludes project/ledger details and authenticated-profile configuration. Browser operation requires installed standard Google Chrome on macOS; other browsers/operating systems are not newly supported by extraction.

The saved `.receipt.json` records stage transitions before submission. If a process ends after submission, the outcome may remain uncertain; a future invocation cannot reuse its reserved output. The caller must inspect the receipt before authorizing another question. BrowserJobs and its transactional submission checkpoints remain in getaudit.

Cookie/profile contents never enter an evidence package. Profiles must remain dedicated local directories. Importing or transferring a saved evidence package to a hosted product is a separate explicit operation; this package does not upload evidence to getaudit.
