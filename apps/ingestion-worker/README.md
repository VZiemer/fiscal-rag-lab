# Ingestão de snapshots

`npm run ingest -- source.json .data/sources` baixa uma URL HTTPS oficial sem seguir redirecionamentos. O JSON de entrada contém `sourceId`, `sourceUrl`, `authority`, `jurisdiction`, `edition`, `publishedAt`, `validFrom`, `validTo`; datas desconhecidas são `null`. Campos de data usam ISO. Limite padrão: 20 MiB e 30 s. O catálogo em `docs/` contém índices de descoberta, não substitui esse manifesto de versão.

Bytes são endereçados por SHA-256. Observações mantêm timestamps separados; repetição da mesma observação é idempotente. Falhas não geram metadados publicados. Parsers devem rejeitar páginas de erro e conferir esquema antes da indexação. Não inferir vigência pelo instante do download.

Source content is *untrusted*; keep it out of privileged instructions, and don't commit downloaded documents by default.
