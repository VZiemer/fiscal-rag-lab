# ADR-0006: Bibliotecas restritas aos adaptadores

- Status: **Accepted**
- Date: 2026-11-14

ExcelJS 4.4.0 faz somente decodificação XLSX no worker; tipos Node e TypeScript são ferramentas de build. Preferimos um parser mantido a implementar ZIP/XML de planilhas, evitando executar fórmulas e recusando células não suportadas. Não há dependência de ExcelJS em domínio fiscal, corpus ou recuperação. Um arquivo oficial cujo esquema mude é rejeitado; a revisão do mapeamento exige fixture e teste. CSV exportado manualmente não é tratado como download original.

Os testes usam planilhas sintéticas com o contrato de colunas documentado, sem redistribuir a tabela oficial. A validação ponta a ponta de cada edição real continua necessária antes de publicação fiscal.

O override `exceljs → uuid 11.1.1` corrige GHSA-w5hq-g745-h8pq sem rebaixar o parser. A API CommonJS `v4` usada pelo ExcelJS permanece disponível; o teste de escrita/leitura XLSX verifica a integração. Revisar o override quando ExcelJS atualizar sua dependência.
