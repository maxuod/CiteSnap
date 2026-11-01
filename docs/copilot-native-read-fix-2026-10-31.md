# Copilot native reply compatibility — 2026-10-31

## Observed failure

The owner authorized one real two-question, one-source acceptance batch. The new
AnswerPouch profile positively confirmed the owner's Copilot account. One question
was submitted once. The original 0.2.0 collector could not recognize the current
copilot.com personal-account reply within its 150-second limit; it retained an
error capture and held the second question without submission. No retry occurred.

The native browser subsequently showed the answer in that same saved conversation.
This is an extraction failure, not evidence that Copilot produced no answer.
The original run, capture and exported JSON remain unchanged. Real account answers,
conversation URLs, identity, profile data and raw exports are not stored here.

## Source change in 0.2.1

Native DevTools Elements inspection identified assistant-only
`data-testid="copilot-message-div"` / `markdown-reply` containers and rendered
`button[data-grouped-citations]` metadata. The reader now bounds text and completion
controls to that assistant root, validates bounded absolute HTTP(S) citation URLs,
and preserves table cell word boundaries. New reply containers are excluded from
all account-verification witnesses. Unknown/malformed citations remain unresolved;
inline metadata alone never establishes full source-panel coverage.

The extractor identifier advances to `visible-dom-v19-host`. Historical provenance
and captures are not relabelled. The original getaudit app/package is not upgraded.

## Verification so far

- Five regression tests cover actual observed structural markers with synthetic
  text, table boundaries, another turn's Copy control, streaming, absent body,
  sidebar/user/hidden content, malformed citation groups and forged account proof.
- Full suite: 221 passed, one existing opt-in skip, nine files. Syntax checks pass.
- The repaired pure reader was run through native DevTools against the already
  existing real conversation: complete body, 3,835 normalized text characters,
  21 citation URLs, zero unresolved metadata entries, zero additional submissions.
  This is explicitly a manual existing-conversation recovery, not a successful
  automatic capture or complete source-panel acceptance.
- The original native application export matches the saved run/tasks/evidence,
  question-set hash, evidence hash and decoded artifact. It truthfully records one
  error and one unsubmitted held task.

## Real automatic capture and final source-coverage correction

The signed local 0.2.1 package matched all 642 manifest entries and 24 source files.
After a normal Quit/reopen, the original local workspace hash was unchanged and
the saved dedicated Copilot login was positively confirmed without credential
entry. Only the second, previously unsubmitted question was frozen separately and
submitted once. Its completed run retained 2,745 text characters and six URLs.
The native export matches the saved run/tasks/evidence, decoded artifact, original
question and all hashes. All six public citation addresses returned HTTP 200, and
one citation button visibly opened the expected official page.

Reviewing the real provider Sources pane exposed another defect: an authored
Sources heading inside an answer could be mistaken for a native source pane.
0.2.2 excludes such overlapping containers. The current native References pane is
recognized only through the selected References tab and its Citations list; an
optional More list cannot establish citation coverage. Complete coverage requires
its bounded card count to match all valid unique URLs in this answer's visible
native citation groups, with no unresolved entries or overflow. The underlying
URLs remain honestly attributed to answer links, not invented source-card hrefs.
The extractor identifier advances to `visible-dom-v20-host`.

The final reader was checked on the same existing conversation with zero further
submissions: six native citation cards, six grouped destination URLs, complete
2,745-character body and zero unresolved entries. Its body SHA-256 and sorted URL
set SHA-256 exactly match the prior automatic export. That 0.2.1 export, including
its original placement labels and completeness metadata, is retained unchanged;
its old completeness heuristic alone is not acceptance evidence. The separate
native pane/card comparison supplies the final source-coverage proof.

Final full suite: 223 passed, one existing opt-in skip, nine files. The two added
source regressions cover authored/nested Sources lookalikes, the real References
relationship, exclusion of More-only lists, missing cards, unresolved entries and
overflow. Final 0.2.2 packaging/native reopen acceptance passed. All 642 manifest
entries and 24 source files match the signed candidate. A normal reopen retained
the exact workspace bytes (two runs / three task records / two distinct submitted
questions) and all prior evidence. The saved Copilot account was positively
reconfirmed with no credential entry or new question. The application remains open
on the saved real answer and its six citations. The original getaudit installed-ASAR
SHA-256 still matches the pre-task baseline.

The complete local-test image is `out/AnswerPouch-0.2.2-mac-arm64-local-test.dmg`,
334,533,929 bytes, SHA-256
`10e59f735448c18d26555c6c425002d56c294e6d6805e5b249e440d14d8204c2`.
Its checksum, read-only mounted 642-entry manifest, strict signature, version and
Applications shortcut passed (`docs/dmg-check-0.2.2.json`). The two closed obsolete
generated bundles and their two local-test images were removed after acceptance;
source history, receipts, real evidence and dedicated profiles remain. No public
release, remote collector repository, upload or deployment occurred.

Total real provider submissions remain **two distinct questions, once each**.
The first is an original failure plus an explicitly manual recovery; the second
has an automatic capture plus an independent read-only source comparison. This
proves one owner's Copilot session, not all six platforms, all customers, indefinite
login validity or clean-machine distribution. Local signing remains distinct from
Developer ID/notarized public delivery. No raw customer answers or credentials are
stored in the repository, and the original getaudit app remains unchanged.
