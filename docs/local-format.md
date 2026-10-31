# Frozen questions and local evidence

## Frozen questions v1

Kind answerpouch.questions, version 1. UUID, name, creation time, ordered question IDs/text and canonical sorted-key body SHA-256 (excluding hash). Preserve nonblank lines and inner whitespace; normalize CRLF separators only. Reject duplicate IDs/text, unknown fields, altered hashes, over 100 questions or over 10,000 characters/question. Import makes a local copy and never transmits questions.

## Local capture v2

Kind answerpouch.local-capture, version 2. Collector/version, run ID, frozen hash, exact question, task/source/submission checkpoint, host, accountVerified, exclusion, original capture and canonical-body SHA-256. accountVerified requires captured logged_in plus signed_in_independent privacy mode. An observed capture missing that is preserved with account_unverified exclusion and stops further tasks.

Original capture schema retains actual answer/citation strings, URL/title/placement, access conditions and bounded original artifact. Empty links never prove absence of sources. Unconfirmed citation completeness stays unknown. Host policy is host-network-only; physical location and network country are unverified. Internal compatibility country ZZ means unknown, not a claimed location. Metadata locale/timezone do not become desktop browser emulation overrides.

## Run export v1

Kind answerpouch.run, version 1. Run/acknowledgement, original frozen set, all tasks and available original evidence, plus canonical-body hash. Observed, restricted/unavailable, not-triggered, error/attention, queued/held, cancelled/interrupted and submitted-but-uncertain remain distinct. Complete means processing ended, not all answers or citations are complete. Browser cookies/login storage/provider secrets are not exported by design.

Hashes detect changes relative to a trusted independently retained hash. They are not a digital signature or proof against someone who can rewrite both content and hash. Preserve original evidence independently when sharing. Historical evidence/identifiers are never rewritten for branding.
