# Carga oficial federal, paulista e mineira

Executada em 14/11/2026, na ordem nacional → São Paulo → Minas Gerais. [Relatório por fonte](data/official-corpus.json) contém URLs exatas, hashes, bytes, observações, contagens e exclusões. Os documentos baixados e o corpus ficam em `.data/`, fora do Git.

| Conteúdo | Carga |
| --- | ---: |
| Fontes baixadas | 71 |
| Fontes indexadas | 66 |
| NCMs completos | 10.516 |
| CFOPs | 619 |
| Evidências nacionais | 13.604 |
| Evidências SP | 8.504 |
| Evidências MG | 11.388 |
| Evidências totais | 33.496 |

As contagens de fontes usam IDs de ingestão: o HTML integral de SP é baixado para dois recortes distintos (livros e anexos). Portanto, as 71 entradas baixadas correspondem a 70 URLs oficiais distintas, não a 71 publicações independentes.

NCM: JSON público Classif da Receita/Siscomex, tabela consultada em 14/11/2026. Inclui hierarquia nas notas para que descrições como “Outros” conservem contexto. Início de vigência e ato informado são preservados; o término sentinela 31/12/9999 vira término desconhecido, com valor original nas notas. O download atual não constitui histórico completo nem permite determinar automaticamente a classificação de um produto.

CFOP: planilha oficial do Portal NF-e publicada em 04/09/2026, IT 2023.002 v2.10, incluindo título, nota explicativa e datas por linha. A edição consultada e as datas da tabela não comprovam que a descrição atual se aplicava a qualquer período passado. Consulta de código não determina a operação correta.

Documentos nacionais: páginas Receita sobre download/Classif; Convênio SINIEF s/n de 1970, Ajuste SINIEF 07/05 e Convênio ICMS 142/18. Contêm documentação de CFOP, situações tributárias, NF-e, substituição tributária e CEST. Extração de texto não é uma tabela estruturada independente para cada classificação.

SP: livros I–V do RICMS/2000 e anexos I–III, extraídos da versão integral oficial. Marcações `revogado`, `sefazElement-TextoRevogado` e texto riscado são removidos. Uma seção corrompida na fonte é excluída; não tentamos completar letras ou condições. O antigo Anexo V revogado não integra este recorte: a consulta CFOP usa a tabela nacional. Outros anexos e atos estaduais avulsos ainda não têm cobertura sistemática.

MG: parte geral e anexos I–X do RICMS/2023, a partir do índice oficial “sem dispositivos revogados”, incluindo suas páginas de continuação. O crawler aceita somente arquivos reconhecidos no mesmo diretório oficial, com limite de páginas. Seletores e encoding são validados; links externos não são seguidos.

Somente arquivados, sem indexação: NCM/uTrib de 02/09/2026, classificação tributária IBS/CBS de 30/10/2026, MOC 7 visão geral e Anexo I, além do índice mineiro de navegação. Planilhas auxiliares precisam de parsers específicos; PDFs exigem extração que preserve tabelas e revisão das notas técnicas posteriores. Estes arquivos não sustentam respostas do RAG enquanto não indexados. NESH integral e todas as soluções de consulta não estão incluídas.

Vigência de consolidações permanece desconhecida. Não há atualização automática, cobertura integral de legislação, validação tributária humana ou embeddings semânticos aprendidos. São Paulo e Minas Gerais são as únicas UFs estaduais incluídas, conforme escolha do usuário.

## Reproduzir e atualizar

```sh
npm ci
npm run ingest:official
# Reprocessar os snapshots locais, sem afirmar uma nova consulta à fonte:
npm run ingest:official -- --reuse
# Reconstrução verificando hashes dos bytes locais:
npm run corpus:build -- .data/official/manifest.json .data/rebuilt-corpus.json
npm start
```

O catálogo versionado é `config/official-sources.json`. Cada fonte gera snapshot imutável e observação de metadados. Falhas são registradas; ausência de NCM, CFOP ou de uma UF pedida impede substituição do corpus ativo. `.data/corpus.json` alimenta o runtime local; `.data/official/corpus.json` alimenta o pacote AWS. Os IDs de evidências de códigos são estáveis por fonte, hash, código e período, independentemente da ordem de montagem.

Publicação: `npm run build:lambda`, `npm run public:prepare -- .data/aws/contact.json .data/aws/public`, `scripts/aws-deploy.ps1 -Action Update`, acompanhar `Status` e concluir `Finish`. A atualização mantém o artefato anterior e os parâmetros secretos. `/health` informa contagens e SHA-256 do corpus efetivamente carregado. `npm run smoke:remote -- https://d2kvl1uo6lcsgz.cloudfront.net/mcp` compara esse hash com o pacote local e verifica códigos presentes/ausentes, citações, buscas SP/MG e protocolos MCP anterior/moderno. Isso não comprova o comportamento da LLM no Work.

Condições de carga local observadas antes da última organização dos IDs: Windows, Node 22.17.0, controle hash lexical 128 dimensões, índice exato + BM25, 32.243 evidências; inicialização 2,41 s, RSS ao final ~521 MiB, medição única sem processo isolado ou GC forçado. Não é benchmark fiscal nem resultado de recuperação avaliado. A edição final possui 33.496 evidências; Lambda passou de 256 para 1.024 MiB para acomodar corpus e índices, sem provisioned concurrency. Os benchmarks fixos de algoritmos permanecem separados desta carga operacional.
