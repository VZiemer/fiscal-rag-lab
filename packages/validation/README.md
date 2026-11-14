# Contratos de validação

A aplicação declara campos com `ObjectContract` e `Field`. Zod é um detalhe privado de `src/schema.ts`; seus tipos e erros não fazem parte da API pública.

```ts
const searchInput = new ObjectContract({
  query: Field.text({ trim: true, minLength: 1, maxLength: 2000 }),
  topK: Field.integer({ min: 1, max: 50 }).optional(),
  mode: Field.choice(['lexical', 'vector', 'hybrid']).optional()
});

const input = searchInput.parse(receivedJson);
// input.query é string; topK e mode são opcionais e tipados.
```

`ObjectContract` rejeita campos extras por padrão. Os limites usam opções nomeadas para facilitar a leitura, sem encadear vários métodos de uma biblioteca. Contratos compostos reutilizam campos por `...outroContrato.fields` ou recebem outro contrato como campo.

| Operação | Resultado |
|---|---|
| `parse(value)` | Devolve os dados validados ou lança `ValidationError`. |
| `safeParse(value)` | Devolve `{success: true, data}` ou `{success: false, issues}`. |
| `optional()` | Permite ausência/`undefined`; não permite `null` por si só. |
| `nullable()` | Permite `null`; não torna o campo opcional. |
| `withDefault(value)` | Preenche valores ausentes, mantendo o tipo de saída obrigatório e cópias independentes de listas/objetos. |
| `toJsonSchema({io, target})` | Descreve a forma dos dados para clientes e documentação. |
| `Infer<typeof contrato>` | Obtém o tipo TypeScript da saída validada. |

`Field` oferece somente os formatos utilizados no projeto: texto, número, inteiro, URL, timestamp, enumeração, literal, lista e união. `check` permite uma verificação adicional, como a validade de uma data do calendário. Essas verificações continuam executadas em runtime, mesmo quando não podem ser expressas em JSON Schema. Uma interface TypeScript sozinha não verifica JSON recebido pela rede.

O [adaptador MCP](../../apps/mcp-server/src/schema-adapter.ts) converte `Schema<T>` para Standard Schema, interface aceita pelo SDK instalado. Ele fornece a validação e os JSON Schemas de entrada/saída. O pacote de validação não importa MCP, e o servidor não precisa importar Zod.

O plano do cliente RAG e as respostas dos experimentos de avaliação usam a mesma API. Erros expõem somente `message` e `path`, sem exigir que consumidores conheçam `ZodError`. A redação exata das mensagens de validação não é um contrato estável; a aplicação deve usar `ValidationError` e os caminhos dos campos. Erros de ferramenta continuam sanitizados pelo servidor.

Zod continua instalado como motor interno e também é dependência do SDK MCP. Esta abstração isola o acoplamento do código consumidor; não remove a biblioteca da árvore de dependências. Uma troca futura do motor requer adaptar este módulo e preservar validação, tipos inferidos e JSON Schema, com os mesmos testes.

`npm run check:boundaries` impede imports de Zod fora de `src/schema.ts`. `npm test` verifica entradas inválidas, objetos aninhados, defaults, planos de ferramentas, inferência TypeScript e chamadas MCP nas duas negociações de protocolo. Decisão arquitetural: [ADR-0011](../../docs/adr/0011-validation-facade.md).
