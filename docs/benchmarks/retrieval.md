# Comparação de recuperação v1

Reproduzir: `npm ci` e `npm run eval:retrieval -- .data/retrieval-results.json`. Resultados completos em `retrieval-results.json`, incluindo **cada consulta**, fontes retornadas, métricas, tempos por categoria, parâmetros, revisão base e hashes do dataset/código. Sementes e condições ficam fixas; os mesmos 40 casos são usados em todas as variantes.

| Variante | Recall@5 | Recall@10 | MRR@10 | Critérios de rota/contexto/abstenção/vigência |
| --- | ---: | ---: | ---: | ---: |
| BM25 | 1,000 | 1,000 | 1,000 | 10/10 |
| Vetorial exata | 1,000 | 1,000 | 0,922 | 10/10 |
| Híbrida RRF | 1,000 | 1,000 | 0,969 | 10/10 |
| Vetorial IVF | 1,000 | 1,000 | 0,932 | 10/10 |
| Vetorial HNSW | 1,000 | 1,000 | 0,922 | 10/10 |

Recall e MRR usam os 32 casos com relevantes; os outros oito não são contados como acertos de recuperação por ausência de gabarito. Dez casos possuem critérios adicionais (incluem os dois temporais). O corpus tem apenas dez paráfrases editoriais de duas páginas da Receita e perguntas lexicalmente próximas. Não há validação humana fiscal nem avaliação de geração de respostas.

O provedor é `lexical-fnv1a-v1`, 128 dimensões, **sem embeddings aprendidos**. BM25 teve melhor MRR neste conjunto; RRF não o superou. Isso não permite concluir desempenho em interpretação de normas. Use Ollama com modelo/digest fixado para uma próxima avaliação semântica; não substituir silenciosamente o provedor do resultado publicado.

Uma única passagem por 40 consultas com um aquecimento por variante. Média/p50/p95 por classe estão no JSON; amostras de duas ou quatro consultas são insuficientes para inferência estatística. Construção inclui embeddings até para a variante lexical porque a composição compartilhada inicializa ambos os índices. Memória usa deltas sequenciais de heap/RSS após GC e pode ser negativa; não representa tamanho isolado. Resultados não foram selecionados por melhor execução.

O retriever pede candidatos antes de aplicar filtros legais; no HNSW esse pedido amplia `ef` ao tamanho do corpus. Os efeitos de aproximação e custo são medidos melhor no [benchmark vetorial independente](README.md). IVF continua limitado às listas sondadas. Não utilizar este corpus pequeno como demonstração de escalabilidade de ANN.
