# Conexão MCP no Codex

Registrado no host com o comando oficial:

```powershell
codex mcp add fiscal_rag_lab --url https://d2kvl1uo6lcsgz.cloudfront.net/mcp
codex mcp get fiscal_rag_lab --json
```

A CLI confirmou `enabled: true` e transporte `streamable_http`. O registro está no arquivo de configuração do usuário, fora do Git; não contém token e não altera a audiência `USER` / `PRIVATE` do plugin. Os servidores existentes foram preservados. Configuração nativa segue a [documentação oficial de MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

O screenshot enviado mostrava somente `blender` e `node_repl`, além do agregador `codex_apps`; não havia um servidor fiscal independente listado. A skill instalada, por si só, não comprovava presença das ferramentas no catálogo desta sessão.

Após atualizar a lista de MCPs ou reabrir o Codex, conferir o servidor `fiscal_rag_lab`. As ferramentas esperadas são `search_regulations`, `get_cfop`, `get_ncm` e `explain_rule`. Iniciar outra conversa no mesmo projeto se o catálogo da conversa atual permanecer sem essas ferramentas. Não é necessário criar outro plugin ou mudar sua privacidade.

Validação realizada: configuração lida pela própria CLI e contratos remotos já testados pelo cliente MCP oficial. A execução por ferramentas dentro desta conversa e no ChatGPT Work ainda depende de atualização do catálogo e não foi declarada concluída. A configuração direta do Codex não substitui uma conexão de app no ChatGPT Work hospedado.
