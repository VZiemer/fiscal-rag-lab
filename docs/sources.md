# Catálogo de fontes oficiais

Revisão: 14/11/2026. Catálogo de pontos de entrada; publicação, vigência e hash são registrados por snapshot, nunca inferidos desta data. A disponibilidade de uma página indexada não comprova disponibilidade do download.

| Fonte | Autoridade / escopo | Formato / atualização | Uso e redistribuição |
| --- | --- | --- | --- |
| [Convênio SINIEF s/n de 1970, Anexo II](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cvsn_70) | CONFAZ / CFOP nacional | HTML consolidado, sujeito a ajustes | Referência normativa; preservar os ajustes e datas. Acesso direto apresentou timeout nesta revisão. |
| [Documentos diversos NF-e](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=%2FNJarYc9nus%3D) | Portal Nacional NF-e / tabela CFOP, NCM-uTrib | Planilhas versionadas; índice consultado lista CFOP de 04/09/2026 | Resolver link de arquivo no portal e fixar checksum; não tratar como fonte histórica completa. Acesso automatizado pode apresentar redirecionamentos. |
| [Informes técnicos NF-e](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=B%2F6oigHgyAw%3D) | Portal Nacional NF-e / alterações técnicas | PDF, IT 2023.002 v2.10 listado no índice consultado | Manual e apresentação editorial: autorização de redistribuição não estabelecida. Armazenamento local apenas. |
| [Download NCM](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul) | Receita Federal / classificação de mercadorias | [JSON público Classif](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json), XLSX | A Receita informa que o download contém a tabela vigente, sem códigos passados ou futuros. Histórico exige consulta específica. |
| [Classif](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/classif) | Receita Federal / histórico NCM | Consulta, notas legais e explicativas | NESH e compilações têm condições próprias: não presumir que acesso público autoriza espelhamento integral. |
| [Portal NF-e](https://www.nfe.fazenda.gov.br/portal/principal.aspx) | ENCAT / RFB / administrações tributárias | MOC, notas técnicas, esquemas XML | Esquema técnico não estabelece sozinho tributação aplicável; conferir versão, ambiente e cronograma. |

Os [arts. 7 e 8 da Lei 9.610/1998](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) distinguem textos de atos oficiais de compilações e outros materiais. A política conservadora do projeto é versionar somente manifestos, scripts e fixtures sintéticas. O catálogo não constitui parecer jurídico sobre licenças. Downloads ficam em `.data/`, ignorado no Git. Não usar mirrors de terceiros quando a fonte oficial falhar.

Procedimento: localizar versão oficial → registrar URL exata e autoridade → baixar com limite e timeout → conferir tipo/conteúdo → SHA-256 → registrar datas conhecidas e campos desconhecidos como `null` → revisar antes de disponibilizar como evidência. Uma alteração de bytes gera nova versão; não sobrescreve o histórico.
