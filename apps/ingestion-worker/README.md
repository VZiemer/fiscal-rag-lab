# Ingestão de snapshots

`npm run ingest -- source.json .data/sources` baixa uma URL HTTPS oficial sem seguir redirecionamentos. O JSON de entrada contém `sourceId`, `sourceUrl`, `authority`, `jurisdiction`, `edition`, `publishedAt`, `validFrom`, `validTo`; datas desconhecidas são `null`. Campos de data usam ISO. Limite padrão: 20 MiB e 30 s. O catálogo em `docs/` contém índices de descoberta, não substitui esse manifesto de versão.

Bytes são endereçados por SHA-256. Observações mantêm timestamps separados; repetição da mesma observação é idempotente. Falhas não geram metadados publicados. Parsers devem rejeitar páginas de erro e conferir esquema antes da indexação. Não inferir vigência pelo instante do download.

Source content is *untrusted*; keep it out of privileged instructions, and don't commit downloaded documents by default.

## Construir o corpus servido

`npm run corpus:build -- manifest.json .data/corpus.json` conecta snapshots aos parsers e ao chunker. O manifesto usa `{version:1,snapshots:[{metadataFile:"sources/id/hash-observacao.json",format:"cfop-xlsx"}]}`. Caminhos de metadados são relativos ao manifesto; os bytes são localizados pelo hash ao lado dos metadados. Formatos: `cfop-xlsx`, `ncm-json`, `legal-text` (este exige `documentId`). O worker verifica hash e tamanho antes de ler, valida duplicidades e relações e grava a saída por substituição atômica. Falha de qualquer entrada preserva o corpus anterior.

`legal-text` aceita texto UTF-8 puro, não PDF ou HTML. Extração/revisão desses formatos ainda precisa de adaptadores próprios; não passar uma página de erro como texto jurídico. Corpus produzido é lido pelo runtime MCP via `MCP_CORPUS`. O embeddamento ocorre ao iniciar o runtime e não altera as fontes.
