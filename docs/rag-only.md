# Fiscal answers using RAG evidence only

User-requested policy: consult Fiscal RAG Lab exclusively for fiscal facts. The skill and `AGENTS.md` require the four tools, evidence/edition citations and abstention when the corpus cannot support an answer. No fallback to web search, browsers, other connectors or code requests. Model memory must not fill fiscal gaps. Returned URLs provide attribution and are not fetched automatically.

The user explicitly authorized a transport exception: call the same four tools through the project MCP client when absent from the native catalog. `scripts/query-rag.ts` restricts calls to those tools and the existing endpoint. This permits no external search, source fetching or memory substitution. It was used for the [first acceptance scenario](initial-scenario.md); it does not establish native tool availability or change other users' policies.

Expected examples:

- Missing code: “Insufficient evidence in the RAG; the complete table is not loaded,” without inventing descriptions or claiming legal nonexistence.
- Unavailable tool: “The RAG could not be consulted,” without external fallback.
- Retrieved evidence: summarize only supported content, cite ID/URL and preserve unknown validity/editorial limitations.

`.codex/config.toml` sets `web_search = "disabled"` for this trusted project after configuration reload. [Official documentation](https://learn.chatgpt.com/docs/web-search). Other projects and plugin visibility are unchanged.

This removes Codex web search but does not independently block browsers, connectors or command networking. The skill guides the client; MCP does not control every ChatGPT/Codex tool. The model retains pretrained knowledge, so grounding instructions neither erase knowledge nor prove support for each sentence.

A custom client could expose only fiscal MCP with mandatory allowlisted calls and no web/browser/shell. The [official API](https://developers.openai.com/api/docs/guides/function-calling) provides `tool_choice` and `allowed_tools`. Citation and claim support validation remain necessary: a valid ID does not prove semantic entailment. Extractive answers can restrict output to retrieved excerpts. That client is not implemented here.

Source ingestion remains separate: authorized downloads update snapshots/corpus; queries do not update automatically. Current tables and selected national/SP/MG documents have [partial coverage](official-ingestion.md). Uncovered questions still require abstention.
