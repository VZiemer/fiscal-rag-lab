# MCP connection in Codex

Registered on the host with the official command:

```powershell
codex mcp add fiscal_rag_lab --url https://d2kvl1uo6lcsgz.cloudfront.net/mcp
codex mcp get fiscal_rag_lab --json
```

The CLI confirmed `enabled: true` and `streamable_http`. Registration lives in the user configuration outside Git, contains no token and does not change the plugin's `USER` / `PRIVATE` audience. Existing servers were preserved. Native setup follows the [official MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

The supplied screenshot showed only `blender`, `node_repl` and the `codex_apps` aggregator, without a separate fiscal server. An installed skill alone did not prove tools were available in that session's catalog.

After refreshing MCPs or reopening Codex, check `fiscal_rag_lab`. Expected tools: `search_regulations`, `get_cfop`, `get_ncm` and `explain_rule`. Start another conversation in the project if the current catalog still lacks them. Another plugin or privacy change is unnecessary.

Verification performed: configuration read through the CLI and remote contracts tested with the official client. Native conversation/ChatGPT Work execution still depended on catalog refresh and was not declared complete. Direct Codex configuration does not replace a hosted ChatGPT Work app connection.

The project includes `.codex/config.toml` with `web_search = "disabled"` and RAG-only instructions in `AGENTS.md`. Private skill 0.1.1 was saved with the same policy; older sessions require configuration/version reload. This setting alone does not block browsers, connectors or code requests. See `docs/rag-only.md`.
