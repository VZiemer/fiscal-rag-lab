# Benchmark vetorial

Reprodução: `npm ci` e `npm run benchmark:vectors -- .data/vector-benchmark.json` (Node 22, na raiz). O JSON versionado registra semente, CPU, memória, parâmetros, hash do código e todas as variantes. Dados uniformes sintéticos: 1.000 vetores de 32 dimensões, 100 consultas independentes, k=10, cinco aquecimentos e três repetições. Busca exata é o gabarito. Não é um benchmark fiscal ou de embeddings semânticos.

| Variante | Recall@10 | Média ms | p95 ms | Construção ms |
| --- | ---: | ---: | ---: | ---: |
| Exata | 1,000 | 0,243 | 0,326 | 1,980 |
| IVF, 16 listas / 4 sondagens | 0,604 | 0,084 | 0,122 | 60,706 |
| HNSW, M=12 / ef=64 | 0,998 | 0,516 | 0,631 | 754,577 |

Nesta escala, HNSW ficou mais lento que a busca exata. As filas ordenadas e o custo de navegar pelo grafo superam a economia de comparações; isso deve orientar otimizações futuras, não ser omitido. O IVF é mais rápido com perda expressiva de recall. Não generalizar estes resultados a grandes corpora.

Memória é delta de heap/RSS num único processo após GC; JIT, alocador e estruturas anteriores interferem. Tamanho JSON é representação diagnóstica (somente o formato exato é restaurável); IVF ainda não tem tamanho serializado. Não comparar esses números com tamanho residente isolado. Desvio entre repetições e isolamento por processo são melhorias futuras, não medições já realizadas.
