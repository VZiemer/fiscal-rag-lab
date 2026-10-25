# Respostas fiscais somente com evidências do RAG

Política solicitada pelo usuário: consultar somente o Fiscal RAG Lab para fatos fiscais. A skill e o `AGENTS.md` exigem consulta às quatro ferramentas, citações de evidências/edições e abstenção quando o corpus não sustenta a resposta. Não há fallback para web, navegadores, outros conectores ou requests por código. Conhecimento memorizado não pode preencher lacunas fiscais. URLs retornadas servem como atribuição; não são buscadas automaticamente.

Exemplos esperados:

- Código sem registro: “Evidência insuficiente no RAG; a tabela completa não está carregada”, sem inventar descrição e sem declarar inexistência legal.
- Ferramenta indisponível: “Não foi possível consultar o RAG”, sem substituição por busca externa.
- Evidência encontrada: resumir somente o conteúdo sustentado, citar ID/URL e manter vigência desconhecida ou limitações editoriais.

No projeto Codex, `.codex/config.toml` usa `web_search = "disabled"`. É uma opção de configuração de projeto confiável; passa a valer quando o host recarrega a configuração. [Documentação oficial](https://learn.chatgpt.com/docs/web-search). Não altera os demais projetos ou a visibilidade do plugin.

Esse controle remove a ferramenta de busca web do Codex, mas não bloqueia sozinho navegadores, conectores ou a rede de comandos. A skill orienta o uso do cliente; o servidor MCP não controla todas as ferramentas expostas pelo ChatGPT/Codex. O modelo continua tendo conhecimento pré-treinado, portanto instrução de grounding não equivale a apagar conhecimento ou provar que cada frase é sustentada.

Para isolamento técnico completo de ferramentas em um cliente próprio, expor somente o MCP fiscal na chamada ao modelo e impor uma allowlist com chamada obrigatória, sem disponibilizar web/browser/shell. A [API oficial](https://developers.openai.com/api/docs/guides/function-calling) oferece `tool_choice` e `allowed_tools`. Ainda é necessário validar as referências e avaliar se cada afirmação é sustentada; um ID de citação válido não prova implicação semântica. Respostas extrativas podem restringir a saída a trechos efetivamente recuperados. Esse cliente próprio não está implementado nesta tarefa.

Ingestão de fontes oficiais permanece separada: downloads autorizados atualizam snapshots/corpus; consultas não fazem atualização automática. O corpus público atual contém somente resumos editoriais sobre NCM/Classif, sem tabelas completas de CFOP/NCM. A política restritiva deve levar à abstenção nas perguntas não cobertas.
