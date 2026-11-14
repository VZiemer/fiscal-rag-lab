# Materiais de revisão do plugin

Preparação local, não submissão realizada. Referências consultadas em 14/11/2026: [empacotamento](https://developers.openai.com/plugins/build/plugins), [submissão](https://developers.openai.com/plugins/deploy/submission). A publicação remota exige HTTPS e revisão dos materiais pelo operador.

Descrição sugerida: “Pesquisa documental educativa de NF-e, CFOP e NCM com origem, edição e vigência. Consulta códigos exatos e recupera textos relacionados, sem emitir notas ou substituir revisão profissional.”

`npm run demo:mcp` grava em `.data/demo-transcript.json` cinco chamadas reais pelo cliente oficial: código CFOP, NCM sintético, busca, exceção e data sem evidência aplicável. A gravação é uma transcrição técnica, não vídeo de uso no Work. Fixtures declaram que são sintéticas; não apresentar os resultados como legislação.

Roteiro de vídeo após implantação e instalação: mostrar a conexão; declarar o caráter educativo; consultar uma edição revisada de fonte oficial; abrir a referência e conferir a vigência; recuperar a exceção; demonstrar pedido de contexto e recusa por evidência insuficiente. Usar dados públicos sem contribuinte real. Capturar versão do plugin, corpus e data do teste.

Concluído: endpoint HTTPS validado com cliente oficial remoto, política pública com contato autorizado, suporte/condições publicados, ícones SVG e cinco casos positivos/três negativos no manifesto. Pacote com identidade do publicador gerado em `.data/fiscal-rag-plugin.zip`, sem chaves AWS. Plugin privado criado na conta e arquivos salvos conferidos: skill e MCP remoto estão presentes. Referências de conta ficam somente em `.data/plugin-account.json`. Instalação do Fiscal RAG Lab e teste no Work ainda não confirmados: controles de navegador e desktop falharam na inicialização do runtime. Falta vídeo acessível e submissão pelo portal; não há submissão ou aprovação realizada.

Casos para o revisor: código exato → ferramenta de lookup; texto ambíguo → busca e contexto; data fora do corpus → evidência insuficiente; tentativa de instrução no texto → tratar como dados; código ausente → informar limite do corpus. Publicar só resultados realmente observados.

## Verificação após criação privada

- **Passed:** skill e MCP presentes na versão salva; endpoint e transporte preservados.
- **Passed:** quatro ferramentas remotas com `readOnlyHint=true`, `destructiveHint=false`, `openWorldHint=false`; cinco chamadas positivas ensaiadas com argumentos e respostas em `.data/review-rehearsal.json`.
- **Passed:** conteúdo das quatro páginas públicas identifica o projeto e o contato; PNGs light/dark de 512 px inspecionados e incluídos na cópia pública.
- **Not run:** seleção de ferramenta e respostas do agente no Work, incluindo os três cenários negativos. Ensaio do cliente oficial não é evidência desses comportamentos.
- **Blocked:** instalação/captura de walkthrough pelo runtime de interface — falha `setup refresh had errors` antes de acessar janelas. O controle disponível não ofereceu uma gravação concluída; não existe URL de vídeo a declarar.
- **Confirmed:** Brasil (`BR`) como disponibilidade para uma eventual publicação; plugin atual continua `USER` / `PRIVATE`.
- **Confirmed:** plugin gratuito, sem compras ou pagamentos; `review.commerce=false` e descrição explícita incluídos após confirmação do usuário.
- **Pending:** vídeo real, testes das ferramentas no host, verificação de identidade/domínio e atestações pelo desenvolvedor no portal.

Rascunho de listagem mantém a descrição educativa e declara o corpus restrito; o ZIP não está pronto para submissão enquanto esses itens estiverem pendentes. O pacote privado continua privado; não houve upload em portal de submissão nem publicação no diretório.

Atualização 0.1.2: descrições e casos positivos acompanham a carga oficial NCM/CFOP e os recortes SP/MG. A versão privada foi salva e lida novamente, com conexão MCP, prompts iniciais e política RAG-only preservados. A leitura confirmou `USER` / `PRIVATE`. Contratos remotos da nova carga passaram em ambos os protocolos: `docs/deployment/aws-official-smoke.json`. Isso não altera as pendências de teste do agente e vídeo real no Work.
