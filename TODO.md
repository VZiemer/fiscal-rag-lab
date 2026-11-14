# Pendências verificáveis

## Dependem de acesso ou decisão externa

- [x] Implantar na AWS com S3/CloudFront, HTTP API e Lambda. HTTPS e ferramentas verificados por cliente MCP oficial remoto; credenciais e contato pessoal permanecem fora do Git.
- [ ] Disponibilizar edições oficiais CFOP/NCM/legislação para revisão de parsing e vigência. Fontes em `docs/sources.md`; não usar mirrors. Downloads diretos apresentaram timeout/redirecionamentos durante a revisão.
- [ ] Instalar e testar o Fiscal RAG Lab em ChatGPT Work. Plugin Creator está disponível e o plugin privado já foi criado; skill e endpoint foram confirmados nos arquivos salvos. Controle de navegador/interface falhou ao iniciar (`setup refresh had errors`); instalação e teste no produto aguardam acesso funcional.
- [x] Registrar o servidor MCP no host Codex como `fiscal_rag_lab`; CLI confirmou habilitação e URL. Aguardar atualização do catálogo para verificar chamadas como ferramentas desta conversa, sem tratar isso como teste já concluído no Work.
- [ ] Gravar demonstração em ChatGPT Work e submeter pelo portal com conta autorizada e materiais reais. Contato público fornecido, política publicada, Brasil escolhido como disponibilidade futura e gratuidade sem pagamentos confirmada pelo usuário. Atestações legais devem ser preenchidas pelo desenvolvedor autorizado. O plugin continua privado e não foi submetido.
- [ ] LoRA e comparação de respostas permanecem em aberto por decisão do usuário. Este host não dispõe de Python, Docker ou nvidia-smi no PATH; não há treinamento executado.

## Melhorias contornáveis

- [ ] Revisar cota de concorrência Lambda antes de reservar capacidade. A conta rejeitou reserva de 2 por exigir mínimo de 10 não reservadas; o deploy usa throttling HTTP API e concorrência compartilhada, sem alterar recursos existentes.

- [ ] Medir memória isolada por processo, variância e tamanho serializado de IVF; substituir filas ordenadas de HNSW por heaps se perfis justificarem.
- [ ] Criar partições temporais/jurisdicionais para filtrar antes da busca sem examinar todos os candidatos.
- [ ] Revisar licenças por edição antes de redistribuir documentos oficiais e obter revisão humana do benchmark fiscal.
