# ADR-0010 — Extração de documentação oficial HTML

Status: aceito, 14/11/2026.

Usamos Cheerio 1.1.2 para interpretar HTML e iconv-lite 0.7.0 para decodificar Windows-1252, apenas no adaptador de ingestão. O domínio, os índices e o MCP não dependem deles. Seletores explícitos identificam conteúdo da Receita Federal, CONFAZ, SEFAZ-SP e SEF-MG; falhas de seleção, encoding ou integridade impedem indexação daquele documento. Seções com caracteres de controle corrompidos na própria fonte são omitidas e contadas no relatório, sem adivinhar letras ou condições legais.

Snapshots preservam bytes, URL, SHA-256, observação e datas conhecidas. A extração remove navegação, scripts e marcações explícitas de redação revogada. O recorte paulista integral contém os livros I–V; anexos selecionados são documentos separados. Em MG seguimos apenas páginas HTML do RICMS/2023 sem dispositivos revogados, no mesmo diretório oficial, com limite de páginas. Não fazemos crawling da internet nem consultas externas durante respostas fiscais.

Encoding segue o cabeçalho HTTP, inclusive Windows-1252 das páginas legais mineiras. Seções de tamanho limitado evitam crescimento quadrático dos vínculos entre fragmentos de tabelas extensas. Isto limita a reconstrução automática entre seções: a resposta deve consultar a fonte integral se uma condição depender de trecho não recuperado. A vigência de consolidações não é inferida da data de download. O sentinela NCM 31/12/9999 é retido nas notas e convertido em término desconhecido.

Redirecionamentos têm limite e ficam na mesma origem HTTPS governamental. Cookies de sessão ficam somente na memória. Planilhas auxiliares ainda sem parser são arquivadas e identificadas como não indexadas. Atualização não é automática: cada execução gera relatório de cobertura e a troca do corpus publicado exige build e verificação.
