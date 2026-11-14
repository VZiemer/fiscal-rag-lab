# Domínio fiscal

`FiscalRuleRepository` e `InMemoryFiscalRepository` implementam consulta exata de CFOP/NCM, versões e intervalos de vigência. Formatação canônica é aceita; código parcial ou aproximado é rejeitado. Registros são copiados defensivamente. Versões sobrepostas retornam ambiguidade, sem escolher silenciosamente uma redação.

Resultados distinguem encontrado, ausente no corpus, evidência insuficiente e ambiguidade. `missingContext` explicita data, UFs, regime e operação necessários para discutir aplicabilidade; lookup não decide o tratamento de uma transação. Nenhuma alíquota é inferida da descrição ou de semelhança textual. Não há emissor ou calculador tributário.

O módulo não importa MCP, HTTP ou SDK de modelo. Parsers XLSX/JSON ficam no adaptador de ingestão. A demo pública não carrega tabela oficial completa de códigos; as consultas retornam ausência no corpus, sem afirmar inexistência legal.
