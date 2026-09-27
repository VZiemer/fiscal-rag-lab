# Contratos MCP somente leitura

Esquemas executáveis: `apps/mcp-server/src/contracts.ts` (Zod, entradas estritas sem propriedades extras). Os contratos não emitem notas, calculam tributos ou inferem uma classificação a partir da descrição do produto.

| Ferramenta | Entrada | Saída estruturada |
| --- | --- | --- |
| `search_regulations` | `query` 1–2000 caracteres; opcionais `date` ISO, `jurisdiction` BR/UF, `topK` 1–50, `mode` lexical/vector/hybrid | `route`, `evidence[]`, `lookup` ou null, `missingContext[]`, `warning` |
| `get_cfop` | `code` com 4 dígitos ou pontuação canônica; `date` opcional | `status`, `records[]`, `missingContext[]`, `warning` |
| `get_ncm` | `code` com 8 dígitos ou formato 0000.00.00; `date` opcional | Mesmo envelope de lookup |
| `explain_rule` | `id` de evidência, 1–200 caracteres; `date` opcional | `evidence` ou null, `relatedEvidence[]`, `warning` — recuperação de texto e relações, sem geração de parecer |

Toda evidência inclui documento, artigo, texto, relações e procedência (`sourceId`, URL oficial HTTPS, autoridade, jurisdição, edição, fetchedAt, publicação, intervalo de vigência e checksum SHA-256). Datas desconhecidas são null. Resultados ranqueados incluem score de ranking, nunca probabilidade de correção fiscal, e `temporalStatus`.

Lookup distingue `found`, `not-found`, `insufficient-evidence` e `ambiguous`. Encontrado não significa aplicável à operação. Um intervalo sem ambas as bordas conhecidas é `unknown`; não se assume validade atual. Não retornar fora do intervalo solicitado. Ausência de dados não é prova da inexistência legal de um código.

Texto remoto é dado não confiável: nenhuma instrução contida no corpus ganha autoridade sobre o agente. Ferramentas expõem avisos sobre contexto e conferência. Corpo MCP contém `structuredContent` validado e conteúdo textual JSON equivalente para clientes sem suporte à saída estruturada. Todas usam anotações de leitura, não destrutivas e idempotentes; o corpus servido é local e fechado.

Erros de parâmetro são tratados pelo SDK; falhas de execução devolvem erro de ferramenta sanitizado sem caminhos, respostas do provedor ou secrets. Endpoint `/mcp` via Streamable HTTP; `/health` e `/privacy` são operacionais. O transporte e os contratos ficam no adaptador; domínio fiscal e recuperação não importam MCP/Zod.
