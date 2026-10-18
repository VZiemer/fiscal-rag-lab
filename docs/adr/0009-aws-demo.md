# ADR-0009: Demo AWS com S3/CloudFront e adaptador Lambda

- Status: **Accepted**
- Date: 2026-11-14

Por escolha do usuário, usar S3 e CloudFront. S3 distribui conteúdo estático; a API MCP requer processamento. Uma HTTP API e Lambda isoladas fornecem o runtime TypeScript, sem banco gerenciado ou servidor permanente. O adaptador transforma eventos HTTP v2 em Request/Response do SDK oficial. esbuild é somente ferramenta de empacotamento; algoritmos e domínio continuam independentes.

O conteúdo inicial é um corpus editorial pequeno com hashes das páginas oficiais e vigência desconhecida; não oferecer tabela completa CFOP/NCM inexistente. Quotas no gateway e logs sanitizados limitam operação. A conta não permite reservar concorrência sem ultrapassar seu mínimo não reservado; não alterar cotas de outros serviços. O header de origem restringe acesso ao backend via distribuição; é um secret operacional, não autenticação de usuário. Arquivos do plugin não carregam credenciais AWS. Treinamento LoRA permanece em aberto por decisão explícita do usuário.

Sharp é uma dependência de desenvolvimento usada somente no empacotamento para renderizar os ícones vetoriais existentes em PNG de submissão. Não entra no bundle Lambda nem em domínio, corpus ou recuperação. O arquivo de lock fixa sua versão; testes verificam formato e dimensões dos arquivos gerados.
