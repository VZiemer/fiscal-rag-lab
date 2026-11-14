# Dataset fixo de avaliação v1

`heldout.json`: 40 consultas separadas de treinamento — 30 de recuperação, 4 de lookup exato sem registro carregado, 2 de contexto insuficiente, 2 de abstenção e 2 de vigência desconhecida. As dez evidências são **paráfrases editoriais**, não transcrições de normas. A procedência aponta às duas páginas oficiais da Receita capturadas em 14/11/2026; checksum corresponde aos bytes HTML originais, preservados localmente em `.data/sources/`, sem mirrors em Git.

O corpus cobre recursos e limites do Classif/download NCM. Não mede recomendação de CFOP, classificação de produtos ou cálculo de tributos. Códigos nas consultas exatas testam ausência no corpus, sem afirmar existência/inexistência legal. Jurisdições, versões com vigência conhecida, exceções e códigos sintéticos são exercitados nos testes de integração, fora desse corpus oficial.

Fonte de download: [Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul). Fonte da plataforma: [Classif](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/classif). Datas de publicação e vigência não foram inferidas de rótulos da página. Ambos os intervalos são desconhecidos e os testes exigem esse estado explicitamente.

Os rótulos foram conferidos editorialmente por agente; revisão humana fiscal continua pendente. Perguntas têm proximidade lexical às paráfrases e o corpus é pequeno. Não usar recall elevado como prova de capacidade em legislação real. Nunca ajustar parâmetros escolhendo os melhores resultados no held-out; para uma próxima versão, criar development set e congelar antes de medir.

Métricas numéricas em `packages/evaluation/`: Recall@5/10 e MRR@10 excluem casos sem relevantes (null), que possuem critérios de rota/contexto/abstenção separados. Resultados por consulta devem acompanhar médias. A avaliação de respostas de LLM e grounding exige outro estágio e não é inferida dessas métricas de recuperação.
