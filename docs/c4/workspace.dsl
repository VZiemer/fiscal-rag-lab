workspace "Fiscal RAG Lab" "Arquitetura do código implementado; detalhes em docs/c4/README.md" {
    !impliedRelationships false
    model {
        researcher = person "Pessoa pesquisadora" "Formula perguntas e confere o contexto e as evidências."
        client = softwareSystem "Cliente MCP / assistente" "Conduz a conversa, chama ferramentas e redige a resposta com evidências."
        official = softwareSystem "Fontes oficiais" "Receita, NF-e, CONFAZ, SEFAZ-SP e SEF-MG. Downloads de manutenção."
        ollama = softwareSystem "Runtime Ollama" "Embeddings aprendidos, se configurado. Não utilizado na Lambda atual."
        fiscal = softwareSystem "Fiscal RAG Lab" "Recupera códigos e textos fiscais com fonte, edição e vigência. Não gera a resposta final da LLM." {
            runtime = container "Servidor MCP + recuperação" "Um processo: protocolo, consultas e índices construídos em memória. Local: HTTP. AWS: Lambda." "Node.js 22 · TypeScript" {
                transport = component "Adaptador MCP / HTTP" "Expõe quatro ferramentas de leitura. Valida e encaminha chamadas." "server.ts · lambda.ts"
                validation = component "Contratos e validação" "Campos, formatos e limites. Zod encapsulado em um módulo." "ObjectContract · Standard Schema"
                retrieval = component "HybridRetriever" "Roteia consulta; filtra jurisdição e vigência; combina por RRF e reúne evidências relacionadas." "packages/retrieval"
                corpus = component "MemoryCorpus" "Textos, proveniência e relações em memória; acesso por ID." "CorpusRepository"
                codes = component "InMemoryFiscalRepository" "Consulta exata CFOP/NCM com versões e limites de vigência." "FiscalRuleRepository"
                embeddings = component "HashEmbeddingProvider" "Contagens por hash: 128 dimensões. Sem semântica aprendida." "EmbeddingProvider · padrão"
                lexical = component "Bm25Index" "Listas invertidas de palavras e pontuação BM25." "Índice lexical próprio"
                vectors = component "BruteForceIndex" "Compara todos os vetores por similaridade de cosseno." "VectorIndex · padrão"
            }
            ingest = container "Worker de ingestão" "Baixa snapshots; extrai e fragmenta. Produz corpus.json e relatórios. Executado fora das consultas." "Node.js · CLI de manutenção"
            store = container "Acervo versionado" "Texto, códigos, metadados e hashes. corpus.json acompanha a Lambda. Não é um banco vetorial remoto." "Arquivos JSON + snapshots"
            site = container "Página e política" "Conteúdo estático da demonstração. Não executa a pesquisa MCP." "HTML · S3 + CloudFront"
        }
        researcher -> client "Faz perguntas"
        client -> fiscal "Consulta ferramentas" "MCP / HTTPS"
        fiscal -> official "Coleta documentos na manutenção" "HTTPS"
        fiscal -> ollama "Solicita vetores se configurado" "HTTP local / HTTPS remoto"
        client -> runtime "Chama ferramentas" "MCP / HTTPS"
        client -> site "Acessa página e política" "HTTPS"
        runtime -> store "Lê corpus ao iniciar"
        ingest -> official "Baixa edições oficiais" "HTTPS"
        ingest -> store "Grava corpus e snapshots"
        transport -> validation "Valida entrada e saída"
        transport -> retrieval "search_regulations"
        transport -> codes "get_cfop / get_ncm"
        transport -> corpus "explain_rule"
        retrieval -> codes "Roteia código completo"
        retrieval -> corpus "Lê trechos e relações"
        retrieval -> embeddings "Vetoriza textos e consulta"
        retrieval -> lexical "Pesquisa palavras"
        retrieval -> vectors "Pesquisa vetores"
    }
    views {
        systemContext fiscal "01-context" {
            include researcher client fiscal official ollama
            autoLayout lr
        }
        container fiscal "02-containers" {
            include client official runtime ingest store site
            autoLayout lr
        }
        component runtime "03-components" {
            include validation transport corpus retrieval codes embeddings lexical vectors
            autoLayout lr
        }
        styles {
            element "Person" {
                background #506579
                color #ffffff
                shape Person
            }
            element "Software System" {
                background #184e78
                color #ffffff
            }
            element "Container" {
                background #184e78
                color #ffffff
            }
            element "Component" {
                background #2570ac
                color #ffffff
            }
        }
    }
}
