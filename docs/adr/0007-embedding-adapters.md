# ADR-0007: Embeddings locais através de porta

- Status: **Accepted**
- Date: 2026-11-14

`EmbeddingProvider` define modelo, dimensão e lotes. O adaptador Ollama usa `POST /api/embed` com `truncate:false`, timeout e validação de contagem/dimensão/valores. Referência: [API oficial](https://docs.ollama.com/api/embed). Não adiciona SDK nem envia dados a serviço remoto por padrão. Instalar o runtime e baixar um modelo depende do ambiente do operador; registrar nome, digest e licença ao executar avaliações semânticas.

Um controle offline FNV-1a de termos normalizados permite testes e demo sem modelo; produz vetores lexicais, **não embeddings semânticos**. Comparações com esse controle não medem compreensão de linguagem. Índices não podem misturar modelos ou dimensões; o manifesto do corpus registra ambos.
