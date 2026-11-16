# Revisão antes da publicação pública

Revisão realizada em 16/11/2026, antes da exposição do histórico em [VZiemer/fiscal-rag-lab](https://github.com/VZiemer/fiscal-rag-lab).

## Escopo e resultados

- Gitleaks 8.30.1: os 37 commits anteriores a este relatório foram examinados, incluindo o histórico completo; nenhum segredo foi detectado. A ferramenta foi obtida da release oficial, com SHA-256 conferido contra o arquivo de checksums da mesma release.
- Revisão complementar dos arquivos e de suas versões históricas: busca por endereços de e-mail, caminhos locais, CPF/CNPJ, identificadores de conta AWS, strings de conexão e nomes de arquivos de credenciais. Os alertas de conteúdo correspondiam a fixtures, metadados públicos de dependências e números de benchmark; não foram encontrados dados fiscais privados nesses arquivos.
- Os quatro diagramas PNG não continham metadados EXIF, XMP, IPTC nem comentários.
- O e-mail corporativo presente nos campos de autor e committer de 36 commits foi substituído pelo endereço `noreply` do GitHub. Todas as árvores de arquivos, mensagens, datas e relações entre commits foram preservadas. Os hashes dos commits mudaram porque os metadados e as referências aos pais mudaram.
- A configuração local de autoria passou a usar o endereço `noreply` para os próximos commits.
- Arquivos operacionais, credenciais, contato do operador e corpus local permanecem em caminhos ignorados. Nenhum arquivo já versionado coincide com as regras de exclusão do Git.

## Separação do histórico antigo

Um bundle do histórico original foi verificado e mantido somente no armazenamento local ignorado. O GitHub ainda permitia consultar objetos antigos pelo hash após a atualização protegida da branch. Por isso, o repositório anterior foi preservado como backup **privado**, e o endereço público recebeu um repositório novo, contendo apenas os commits com autoria revisada. O commit antigo usado na verificação não foi encontrado no repositório público.

O campo histórico `revision` do [benchmark de recuperação](benchmarks/retrieval-results.json) foi preservado para não alterar um resultado já registrado. Sua equivalência após a substituição dos metadados é:

| Revisão registrada no benchmark | Revisão com autoria revisada |
|---|---|
| `a2b6004d27d99a3d68af69aaac8b897abb280c1b` | `a7ebed8dd8bc90f7eefdfcaaa5c7833d5f1a5a47` |

## Verificações técnicas

Em uma cópia limpa dos arquivos versionados, sem o corpus de produção nem credenciais, passaram `npm ci`, os 50 testes, a checagem de fronteiras, o build Lambda com `--demo` e `npm audit --omit=dev` (zero vulnerabilidades reportadas). O workflow foi validado com actionlint 1.7.12. Ele recebe eventos de push, pull request e execução manual, com permissão somente de leitura e sem acesso a segredos de implantação.

Os eventos de push e pull request foram observados no GitHub durante a revisão. A suíte remota não chegou a iniciar os testes; os resultados locais acima não devem ser apresentados como uma execução bem-sucedida no GitHub Actions.

Essa revisão registra os procedimentos e resultados observados; uma varredura por padrões não garante ausência absoluta de dados sensíveis. Novos arquivos e commits exigem a mesma atenção, especialmente antes de incluir logs, exportações, documentos fiscais ou artefatos operacionais.
