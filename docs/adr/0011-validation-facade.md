# ADR-0011: Contratos próprios e encapsulamento de Zod

- Status: **Accepted**
- Date: 2026-11-14
- Refines: [ADR-0008](0008-mcp-runtime.md)

## Contexto

Os contratos MCP, o cliente de consultas e a avaliação de comportamento importavam Zod diretamente. As declarações acumulavam métodos encadeados e os consumidores dependiam de `ZodType`, `z.infer` e erros da biblioteca. O usuário pediu uma abstração em classes para facilitar a leitura e encapsular essa dependência.

## Decisão

`packages/validation/src/schema.ts` oferece `Schema<T>`, `ObjectContract`, `Field`, `Infer` e `ValidationError`. Campos usam opções nomeadas. Objetos são estritos por padrão, com composição de campos, opcionais, nulos, defaults e validações adicionais. Os objetos Zod ficam em um `WeakMap` privado; tipos públicos e declarações compiladas não exportam tipos do fornecedor.

O módulo mantém Zod como motor de validação e geração de JSON Schema. Isso preserva os formatos existentes sem criar um segundo motor de parsing. A fachada contém somente as operações atualmente necessárias, em vez de reproduzir toda a API Zod.

O SDK MCP 2.4.0 instalado aceita Standard Schema com conversão JSON. `apps/mcp-server/src/schema-adapter.ts` adapta os contratos próprios para essa interface. O pacote de validação não depende do SDK, e os contratos/servidor/scripts/avaliação não importam Zod. O verificador de fronteiras restringe esse import a um único arquivo.

## Consequências e verificação

Uma substituição futura do motor fica concentrada na fachada, mas ainda exige preservar os contratos e testes. Zod permanece dependência de runtime e dependência transitiva do SDK; esta decisão não promete sua remoção completa.

O cliente usa uma união de quatro contratos estritos com nomes literais de ferramentas. Ela preserva a associação entre nome e argumentos, tanto em runtime quanto na inferência TypeScript. Como há apenas quatro variantes, a tentativa sequencial tem custo limitado; não foi necessário expor um recurso específico de união discriminada do fornecedor.

Os JSON Schemas de entrada e saída dos nove contratos preexistentes foram comparados antes/depois e permaneceram idênticos. Erros locais passam a ser `ValidationError`; o texto exato de uma mensagem não é API estável. Testes verificam rejeição de campos extras, datas inválidas, limites, defaults, tipos públicos, planos restritos e integração HTTP MCP nas negociações moderna e anterior. Validações de calendário não representáveis no JSON Schema continuam executadas pela ponte Standard Schema.
