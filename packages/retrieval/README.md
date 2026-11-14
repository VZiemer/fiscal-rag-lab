# Recuperação documental

Implementado: chunker de texto legal com relações, BM25 invertido próprio, porta de embeddings, roteamento de identificadores completos e fusão RRF. Índices exato, IVF/K-Means e HNSW ficam em `packages/vector-core`. Nenhum deles delega busca a biblioteca vetorial pronta.

`HybridRetriever.create` recebe corpus, repositório de códigos, provedor de embeddings e índice vetorial por portas. Saídas distinguem a rota e incluem pontuação de ranking, procedência, vigência e relações legais. O filtro temporal elimina intervalos incompatíveis e mantém como desconhecidos os limites não estabelecidos. A busca obtém candidatos antes de filtrar; particionamento para corpora grandes está no TODO.

O controle offline de embeddings é lexical, sem semântica aprendida. Os [benchmarks](../../docs/benchmarks/retrieval.md) publicam dados, condições e falhas; recall não mede correção fiscal. Exceções são ligações heurísticas no texto, não interpretação jurídica automática.
