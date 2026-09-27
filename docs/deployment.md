# Preparação de implantação HTTPS

Implementado e testado localmente: `/mcp`, `/health`, `/privacy`, quota 60 requisições/minuto por conexão de origem, quota global 600/minuto, máximo 16 simultâneas, corpo 64 KiB, validação Host/Origin, logs sem conteúdo de consulta. Quotas contam chamadas HTTP, inclusive negociação e listagem de ferramentas.

TODO externo: não existe provedor, domínio ou conta de deploy configurados. Docker não está instalado neste ambiente; o empacotamento foi preparado mas a imagem não foi construída. Não há endpoint público ativo nem teste de TLS realizado.

Para um host Linux com Docker Compose e DNS já apontado:

1. Revisar e montar um corpus público em `.data/public-corpus/corpus.json`. Não publicar fixtures sintéticas como normas reais.
2. Configurar `FISCAL_DOMAIN` no ambiente do operador. Executar `docker compose -f deploy/compose.yaml up --build -d`. O Caddy solicita TLS; a API não expõe porta direta.
3. Conferir `/health`, `/privacy` e os contratos com cliente MCP remoto. Revisar políticas de logs da infraestrutura e informar contato do operador na política antes de abrir ao público.
4. Fixar digests de imagens após validação de arquitetura e plataforma, registrar revisão Git, hash do corpus e parâmetros. Não registrar certificados, tokens nem dados fiscais privados em Git.

O limite por origem usa o endereço de socket, ignorando `X-Forwarded-For`. Atrás do proxy todos compartilham esse limite; a quota global evita multiplicação. Para segmentação real por cliente, implementar autenticação ou um proxy confiável com política explícita. Esta demo lê um corpus local e não requer autenticação; nunca montar dados privados nesse modo.

Logs da aplicação contêm só ID aleatório, rota categorizada, status e duração. O Compose limita rotação por tamanho, não por prazo. Caddy não habilita access log; infraestrutura pode manter logs próprios e precisa de revisão. `/privacy` descreve o protótipo, sem inventar identidade ou contato do operador.

Rollback: voltar à imagem anterior e ao corpus imutável anterior. Prontidão só é exposta após carregar e indexar o corpus; falha no carregamento impede o servidor de iniciar. O runtime de embeddings Ollama não está incluído no Compose; o controle lexical offline é o padrão.
