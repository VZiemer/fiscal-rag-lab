# Pendências verificáveis

## Dependem de acesso ou decisão externa

- [x] Implantar na AWS com S3/CloudFront, HTTP API e Lambda. HTTPS e ferramentas verificados por cliente MCP oficial remoto; credenciais e contato pessoal permanecem fora do Git.
- [ ] Disponibilizar edições oficiais CFOP/NCM/legislação para revisão de parsing e vigência. Fontes em `docs/sources.md`; não usar mirrors. Downloads diretos apresentaram timeout/redirecionamentos durante a revisão.
- [ ] Instalar e testar o plugin em ChatGPT Work com endpoint HTTPS real; registrar resultados sem dados privados.
- [ ] Gravar demonstração em ChatGPT Work e submeter pelo portal com conta autorizada e materiais reais. Contato público já fornecido e política publicada. Plugin Creator ainda não instalado nesta sessão.
- [ ] LoRA e comparação de respostas permanecem em aberto por decisão do usuário. Este host não dispõe de Python, Docker ou nvidia-smi no PATH; não há treinamento executado.

## Melhorias contornáveis

- [ ] Revisar cota de concorrência Lambda antes de reservar capacidade. A conta rejeitou reserva de 2 por exigir mínimo de 10 não reservadas; o deploy usa throttling HTTP API e concorrência compartilhada, sem alterar recursos existentes.

- [ ] Medir memória isolada por processo, variância e tamanho serializado de IVF; substituir filas ordenadas de HNSW por heaps se perfis justificarem.
- [ ] Criar partições temporais/jurisdicionais para filtrar antes da busca sem examinar todos os candidatos.
- [ ] Revisar licenças por edição antes de redistribuir documentos oficiais e obter revisão humana do benchmark fiscal.
