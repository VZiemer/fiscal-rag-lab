# Servidor MCP

`npm start -- --demo` inicia em `127.0.0.1:3000`, com corpus **sintético e sem valor fiscal**. Para dados revisados, configurar `MCP_CORPUS=.data/corpus.json` com `{version:1,evidence:[...],codes:[...]}`. Não há corpus oficial embutido. Exemplo do formato: `test/fixtures/demo-corpus.json`; substituir também a procedência sintética. Nunca usar URLs ou hashes fictícios em dados oficiais.

Ferramentas: `search_regulations`, `get_cfop`, `get_ncm`, `explain_rule`. Contratos em `docs/mcp-contracts.md`. SDK oficial com negociação 2026-07-28 e compatibilidade stateless anterior; integração testada com cliente oficial independente por socket HTTP. Cada requisição cria sua instância MCP. Busca usa índice exato por padrão; os índices aproximados são comparados separadamente.

Embeddings: `EMBEDDING_PROVIDER=hash` usa controle lexical offline. Para semântica, configurar `ollama`, `EMBEDDING_MODEL` com modelo fixado, `EMBEDDING_DIMENSIONS` e `OLLAMA_URL`; o runtime precisa estar disponível. Não misturar modelos na mesma avaliação. O corpus é indexado ao iniciar; nenhuma consulta grava no corpus.

`/health` retorna prontidão após carregar/indexar corpus. Corpo máximo 64 KiB, timeout HTTP, validação de Host/Origin e erros sanitizados. `MCP_ALLOWED_HOSTS` recebe hostnames separados por vírgula; `MCP_ALLOWED_ORIGINS` recebe origens exatas. Não confiar automaticamente em `X-Forwarded-*`. TLS e limites operacionais são tratados no escopo de implantação. Domínio e recuperação não importam o SDK.
