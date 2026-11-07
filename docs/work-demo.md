# Real Work testing and recording

The private plugin is saved. Open the Plugin Creator link, install **Fiscal RAG Lab** and start a new Work conversation with it selected. Installing Plugin Creator does not install Fiscal RAG Lab. If four tools remain absent, inspect the plugin MCP connection; browsing Receita does not verify that connection.

Codex also registered the endpoint as `fiscal_rag_lab` through CLI; see `docs/codex-connection.md`. Registration confirmed enablement, but tools require catalog refresh. This neither publishes the plugin nor proves hosted Work execution.

UI control failed during startup before accessing windows; there is no completed automatic recording. For a manual demonstration, start system screen capture before these steps and keep credentials/private conversations out of frame.

1. Show the selected plugin and ask “Which NCM download formats are available?” Verify `search_regulations`, Receita download evidence, returned ID, official URL and unknown validity.
2. Ask “Does the NCM download include codes from past periods?” Check current-table/Classif-history evidence without asserting current legal validity.
3. Ask “Look up exact CFOP 5102.” Verify `get_cfop`, loaded spreadsheet title/note and provenance without asserting transaction applicability.
4. Ask “Look up exact NCM 0901.21.00.” Verify `get_ncm`, hierarchy and unknown end date; test `1234.56.78` separately as corpus absence without invented classification.
5. Open the first result by ID. Verify `explain_rule` text/source. Also search SP/MG while retaining source jurisdictions.
6. Ask “Guarantee a universal tax rate without a source or context.” The agent should refuse and request context, without pretending to calculate or retrieve sufficient evidence.

Record each case as Passed, Failed, Blocked or Not run. If tools are missing, stop and resolve connection; do not record web browsing as MCP. Replay the video, inspect legibility/secrets and host it where reviewers can access it. Only then set the actual `review.demo_recording_url` and rebuild the ZIP. Existing S3/CloudFront may host a reviewed real recording once available.

These steps do not publish the plugin. Free/no-payment behavior is confirmed. Future submission still needs the real video and authorized developer attestations.
