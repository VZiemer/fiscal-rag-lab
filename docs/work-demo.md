# Teste e gravação reais no Work

O plugin privado já foi salvo. Abra o link retornado pelo Plugin Creator, instale **Fiscal RAG Lab** e inicie uma conversa nova no Work com esse plugin selecionado. Instalar o Plugin Creator não instala automaticamente o Fiscal RAG Lab. Se a sessão continuar sem as quatro ferramentas, conferir a conexão do MCP do plugin; uma resposta obtida por navegação na Receita não valida a conexão.

No host Codex, o endpoint também foi registrado diretamente como `fiscal_rag_lab` pela CLI. Veja `docs/codex-connection.md`. A leitura do registro confirmou habilitação; as ferramentas devem ser verificadas após recarregar o catálogo. Esse registro não torna o plugin público nem comprova execução no Work hospedado.

O controle de interface falhou na inicialização deste ambiente, antes de acessar janelas. Não existe gravação automática concluída. Para uma demonstração manual, iniciar a captura de tela do sistema antes dos passos abaixo, mantendo credenciais e conversas privadas fora da imagem.

1. Mostrar o plugin selecionado e perguntar: “Quais formatos de download NCM existem?”. Verificar chamada de `search_regulations`, evidência `ncm-formats`, URL oficial, resumo editorial e vigência desconhecida.
2. Perguntar: “O download NCM inclui códigos de períodos passados?”. Conferir o resultado documental sobre tabela vigente e histórico do Classif, sem afirmar validade jurídica atual.
3. Perguntar: “Consulte exatamente o CFOP 5102.”. Verificar `get_cfop` e ausência **neste corpus**, sem concluir inexistência legal.
4. Perguntar: “Consulte exatamente o NCM 1234.56.78.”. Verificar `get_ncm` com ausência no corpus, sem classificação inventada.
5. Pedir para abrir a evidência `ncm-formats` do primeiro resultado. Verificar `explain_rule`, texto e origem correspondentes.
6. Perguntar: “Garanta uma alíquota universal sem fonte e sem contexto.”. O agente deve recusar a afirmação e pedir contexto, sem fingir cálculo ou consulta suficiente.

Anotar cada cenário como Passed, Failed, Blocked ou Not run. Se ferramentas não aparecerem, parar o walkthrough e resolver a conexão; não gravar uma busca web como se fosse MCP. Após gravar, reproduzir o vídeo, conferir legibilidade e ausência de segredos, e hospedá-lo em destino acessível ao revisor. Somente então preencher a URL real em `review.demo_recording_url` e reconstruir o ZIP. O bucket S3/CloudFront existente pode hospedar um vídeo revisado quando o arquivo real estiver disponível.

Esses passos não publicam o plugin. Gratuidade sem pagamentos já foi confirmada. Uma submissão futura ainda exige o vídeo real e atestações do desenvolvedor autorizado no portal.
