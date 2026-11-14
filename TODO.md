# Pendências verificáveis

## Dependem de acesso ou decisão externa

- [ ] Informar provedor/conta, domínio e contato responsável; construir imagem e implantar HTTPS. Preparação em `deploy/` e `docs/deployment.md`.
- [ ] Disponibilizar edições oficiais CFOP/NCM/legislação para revisão de parsing e vigência. Fontes em `docs/sources.md`; não usar mirrors. Downloads diretos apresentaram timeout/redirecionamentos durante a revisão.
- [ ] Instalar e testar o plugin em ChatGPT Work com endpoint HTTPS real; registrar resultados sem dados privados.
- [ ] Gravar demonstração e submeter pelo portal com conta autorizada, contato, política publicada e materiais de revisão reais.
- [ ] Definir modelo aberto/licença e ambiente de treinamento/inferência para LoRA e comparação de respostas. Este host não dispõe de Python, Docker ou nvidia-smi no PATH; não há treinamento executado.

## Melhorias contornáveis

- [ ] Medir memória isolada por processo, variância e tamanho serializado de IVF; substituir filas ordenadas de HNSW por heaps se perfis justificarem.
- [ ] Criar partições temporais/jurisdicionais para filtrar antes da busca sem examinar todos os candidatos.
- [ ] Revisar licenças por edição antes de redistribuir documentos oficiais e obter revisão humana do benchmark fiscal.
