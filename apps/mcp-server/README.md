# MCP server (planned)

Target: Streamable HTTP MCP endpoint, initially read-only, with tools `search_regulations`, `get_cfop`, `get_ncm`, `explain_rule`; later `validate_operation`. Return structured evidence: source URL, document ID, article, valid dates, evidence excerpts, confidence/evidence level and missing input fields.

The server depends on retrieval/fiscal ports, not on a particular chatbot or model. Test with a standalone MCP client before registering as a ChatGPT personal plugin.
