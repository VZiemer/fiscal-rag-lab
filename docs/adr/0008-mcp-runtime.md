# ADR-0008: SDK MCP oficial e validação na borda

- Status: **Accepted**
- Date: 2026-11-14

Usar o SDK TypeScript oficial no adaptador HTTP, com Zod para contratos de entrada e saída. Implementar JSON-RPC, negociação e transporte manualmente ampliaria a superfície de erros sem contribuir para o objetivo de estudar recuperação. O domínio mantém portas próprias.

Refinamento no [ADR-0011](0011-validation-facade.md): Zod fica encapsulado no módulo de validação; contratos usam classes próprias, e o adaptador MCP utiliza Standard Schema. A biblioteca não faz parte da API consumida pela aplicação.

O servidor é stateless, sem retenção de consultas e sem ferramentas de escrita. A fábrica cria instâncias por requisição; não compartilhar um McpServer conectado entre clientes. [Referência oficial](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28): `createMcpHandler` permite negociação moderna e compatibilidade stateless com clientes anteriores. Versões reais ficam fixadas no lockfile e a compatibilidade é verificada por cliente oficial independente.
