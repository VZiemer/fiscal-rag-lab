# Review before public publication

Reviewed on 2026-11-16 before exposing history at [VZiemer/fiscal-rag-lab](https://github.com/VZiemer/fiscal-rag-lab).

## Scope and results

- Gitleaks 8.30.1 scanned all 37 preceding commits without detecting secrets. The official release's SHA-256 was checked against its published checksums.
- Additional file/history review checked emails, local paths, CPF/CNPJ, AWS account identifiers, connection strings and credential filenames. Content alerts were fixtures, public dependency metadata and benchmark numbers; no private fiscal data was found in those files.
- Four PNG diagrams contained no EXIF, XMP, IPTC metadata or comments.
- Corporate author/committer emails in 36 commits were replaced by GitHub `noreply`. During that email-only rewrite, file trees, messages, dates and parent relationships were preserved. Commit hashes changed with metadata/parent references.
- Local authorship configuration now uses `noreply` for future commits.
- Operational files, credentials, operator contact and local corpus remain ignored. No tracked file matches Git exclusion rules.

## Separating old history

An original-history bundle was verified and kept in ignored local storage. GitHub still resolved old objects by hash after a protected branch update. The previous repository was therefore preserved as a **private** backup, and a new repository at the public address received only reviewed-author commits. The old commit used for verification was not found in the public repository.

The historical `revision` in the [retrieval benchmark](benchmarks/retrieval-results.json) was preserved rather than modifying recorded results. Its mapping immediately after email replacement was:

| Recorded benchmark revision | Revision after email replacement |
|---|---|
| `a2b6004d27d99a3d68af69aaac8b897abb280c1b` | `a7ebed8dd8bc90f7eefdfcaaa5c7833d5f1a5a47` |

Later date rewrites change commit hashes again; the table records the email-review stage, not a promise that those hashes are current branch tips.

## Technical verification

A clean checkout without production corpus/credentials passed `npm ci`, all 50 tests, boundary checks, Lambda build with `--demo` and `npm audit --omit=dev` (zero reported vulnerabilities). actionlint 1.7.12 validated the workflow. It accepts push, pull request and manual events with read-only permissions and no deployment secrets.

Push/pull-request events were observed on GitHub. The remote suite did not start tests; local results must not be presented as a successful GitHub Actions run.

This records observed procedures/results; pattern scanning does not guarantee absolute absence of sensitive data. New files/commits require the same care, especially logs, exports, fiscal documents and operational artifacts.
