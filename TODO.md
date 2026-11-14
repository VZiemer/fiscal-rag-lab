# Pendências verificáveis

## Dependem de acesso ou decisão externa

- [x] Implantar na AWS com S3/CloudFront, HTTP API e Lambda. HTTPS e ferramentas verificados por cliente MCP oficial remoto; credenciais e contato pessoal permanecem fora do Git.
- [x] Baixar e carregar edições oficiais CFOP/NCM e legislação nacional, paulista e mineira. Relatório por fonte em `docs/data/official-corpus.json`; bytes locais fora do Git. Revisão tributária humana e cobertura histórica permanecem pendentes.
- [ ] Instalar e testar o Fiscal RAG Lab em ChatGPT Work. Plugin Creator está disponível e o plugin privado já foi criado; skill e endpoint foram confirmados nos arquivos salvos. Controle de navegador/interface falhou ao iniciar (`setup refresh had errors`); instalação e teste no produto aguardam acesso funcional.
- [x] Registrar o servidor MCP no host Codex como `fiscal_rag_lab`; CLI confirmou habilitação e URL. Aguardar atualização do catálogo para verificar chamadas como ferramentas desta conversa, sem tratar isso como teste já concluído no Work.
- [ ] Gravar demonstração em ChatGPT Work e submeter pelo portal com conta autorizada e materiais reais. Contato público fornecido, política publicada, Brasil escolhido como disponibilidade futura e gratuidade sem pagamentos confirmada pelo usuário. Atestações legais devem ser preenchidas pelo desenvolvedor autorizado. O plugin continua privado e não foi submetido.
- [ ] LoRA e comparação de respostas permanecem em aberto por decisão do usuário. Este host não dispõe de Python, Docker ou nvidia-smi no PATH; não há treinamento executado.

## Melhorias contornáveis

- [ ] Melhorar recuperação do caso inicial de ferragens SP→MG: consultas amplas de revenda ranquearam devolução/transferência acima do candidato pertinente; não escolher CFOP apenas pelo primeiro resultado. Recuperar fundamento explícito do grupo interestadual, protocolos/regras aplicáveis à ST para o produto/operação e vigência por dispositivo. O contrato documental em `eval/scenarios/initial-hardware-sale.json` não certifica aplicação fiscal.
- [ ] Separar e filtrar redações históricas do CONFAZ por vigência do dispositivo: a consulta inicial retornou passagens com datas históricas no texto, embora a proveniência da consolidação tenha limites desconhecidos. Não tratá-las como regras atuais.

- [ ] Rever na fonte a seção paulista omitida por caracteres corrompidos; não completar texto por inferência. Não declarar cobertura integral dos livros/anexos extraídos. Detalhes em `docs/official-ingestion.md`.
- [ ] Implementar parsers próprios de esquema para as planilhas auxiliares NCM/uTrib e cClassTrib IBS/CBS já baixadas. Extrair e revisar tabelas dos PDFs MOC 7 e cruzar com notas técnicas posteriores antes de indexar. Arquivamento não significa evidência disponível ao RAG.
- [ ] Ampliar a cobertura de atos avulsos de SP/MG e das demais normas federais necessárias por caso de uso; manter outras UFs fora deste escopo. Criar atualização programada somente após definir política de revisão de diferenças.

- [ ] Avaliar no host a política RAG-only: citar apenas evidências retornadas e recusar fallback para web/memória em perguntas sem suporte. Skill privada 0.1.1 salva; configuração de projeto desativa busca web. Não confundir isso com isolamento de todas as ferramentas ou validação semântica de cada afirmação.

- [ ] Revisar cota de concorrência Lambda antes de reservar capacidade. A conta rejeitou reserva de 2 por exigir mínimo de 10 não reservadas; o deploy usa throttling HTTP API e concorrência compartilhada, sem alterar recursos existentes.

- [ ] Medir memória isolada por processo, variância e tamanho serializado de IVF; substituir filas ordenadas de HNSW por heaps se perfis justificarem.
- [ ] Criar partições temporais/jurisdicionais para filtrar antes da busca sem examinar todos os candidatos.
- [ ] Revisar licenças por edição antes de redistribuir documentos oficiais e obter revisão humana do benchmark fiscal.
