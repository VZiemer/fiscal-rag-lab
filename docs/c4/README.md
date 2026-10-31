# Diagramas C4

As vistas documentam a implementação do repositório: MCP e recuperação executam no mesmo processo; ingestão ocorre em uma CLI separada; vetores e BM25 são construídos na inicialização do servidor. Não representam uma nova implantação AWS.

| Nível | Vista | Arquivo |
|---|---|---|
| 1 — Contexto | Usuário, cliente MCP, laboratório e integrações externas. | [PNG](images/01-context.png) · [SVG](images/01-context.svg) |
| 2 — Contêineres | Servidor, worker, acervo de arquivos e página estática. | [PNG](images/02-containers.png) · [SVG](images/02-containers.svg) |
| 3 — Componentes | Adaptador, contratos, recuperador, repositórios e índices no processo servidor. | [PNG](images/03-components.png) · [SVG](images/03-components.svg) |
| 4 — Código | Recorte da porta `VectorIndex<T>`, implementações e cosseno. | [PNG](images/04-code.png) · [SVG](images/04-code.svg) |

## Fonte e geração

A fonte compartilhada é [model.json](model.json): elementos, relacionamentos, descrições e posições das quatro vistas. [render-c4.ts](../../scripts/render-c4.ts) gera os SVGs, converte para PNG com Sharp e exporta os níveis 1–3 para [Structurizr DSL](workspace.dsl). As posições manuais são usadas no SVG/PNG; o DSL utiliza seu próprio layout automático. O nível 4 permanece um recorte de classes em imagem, sem simular uma vista de código nativa no DSL.

Na raiz do projeto:

```sh
npm ci
npm run docs:c4
```

O comando não usa serviços remotos, Graphviz, Docker ou Java. O renderizador verifica IDs, extremos de relações, limites das caixas e tamanho do texto. Depois de mudar o modelo, gere as imagens, revise-as visualmente e versione o modelo, SVGs, PNGs e DSL juntos.

As imagens têm 1.600 pixels de largura. A fonte preferida é Segoe UI, com fallback do sistema; diferenças de fontes instaladas podem alterar a rasterização entre ambientes. A geração é reproduzível quanto ao modelo e às rotas, sem prometer PNG idêntico em sistemas com fontes diferentes.

## Como interpretar

- Azul identifica elementos internos; cinza identifica pessoas/sistemas externos; verde identifica o acervo de arquivos.
- No nível 1, a relação tracejada com Ollama é opcional e não está ativa na Lambda.
- No nível 4, caixa clara tracejada é uma interface, setas tracejadas indicam implementação e caixas amarelas identificam índices experimentais.
- Contêiner C4 significa unidade executável ou armazenamento, não necessariamente contêiner Docker.
- O acervo representa snapshots no ambiente de ingestão e `corpus.json` distribuído ao servidor; a Lambda não lê todo o arquivo de snapshots a cada consulta.
- As setas indicam uso/dependência ou escrita/leitura. Respostas de rede retornam pelo mesmo caminho; não há uma seta adicional para cada retorno.

O modelo substitui a representação inicial que separava MCP e recuperação em processos e colocava embeddings dentro do worker. Esta é uma correção documental para o comportamento de [runtime.ts](../../apps/mcp-server/src/runtime.ts), não uma mudança da arquitetura executável. Fundamentação em [ADR-0001](../adr/0001-modular-monolith.md), [ADR-0002](../adr/0002-manual-vector-index.md), [ADR-0007](../adr/0007-embedding-adapters.md) e [ADR-0011](../adr/0011-validation-facade.md).
