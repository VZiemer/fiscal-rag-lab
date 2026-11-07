workspace "Fiscal RAG Lab" "Architecture of the implemented code; details in docs/c4/README.md" {
    !impliedRelationships false
    model {
        researcher = person "Researcher" "Asks questions and reviews context and evidence."
        client = softwareSystem "MCP client / assistant" "Conducts conversations, calls tools and writes evidence-based answers."
        official = softwareSystem "Official sources" "Receita, NF-e, CONFAZ, SEFAZ-SP and SEF-MG. Maintenance downloads."
        ollama = softwareSystem "Ollama runtime" "Learned embeddings, if configured. Not used by the current Lambda."
        fiscal = softwareSystem "Fiscal RAG Lab" "Retrieves tax codes and texts with source, edition and validity. Does not generate the LLM answer." {
            runtime = container "MCP server + retrieval" "One process: protocol, queries and in-memory indexes. Local: HTTP. AWS: Lambda." "Node.js 22 · TypeScript" {
                transport = component "MCP / HTTP adapter" "Exposes four read-only tools. Validates and dispatches calls." "server.ts · lambda.ts"
                validation = component "Contracts and validation" "Fields, formats and limits. Zod encapsulated in one module." "ObjectContract · Standard Schema"
                retrieval = component "HybridRetriever" "Routes queries; filters jurisdiction and validity; combines through RRF and attaches related evidence." "packages/retrieval"
                corpus = component "MemoryCorpus" "In-memory texts, provenance and relationships; lookup by ID." "CorpusRepository"
                codes = component "InMemoryFiscalRepository" "Exact CFOP/NCM lookup with editions and validity limits." "FiscalRuleRepository"
                embeddings = component "HashEmbeddingProvider" "Hash counts: 128 dimensions. No learned semantics." "EmbeddingProvider · default"
                lexical = component "Bm25Index" "Inverted word lists and BM25 scoring." "Custom lexical index"
                vectors = component "BruteForceIndex" "Compares every vector using cosine similarity." "VectorIndex · default"
            }
            ingest = container "Ingestion worker" "Downloads, extracts and chunks. Produces corpus.json and reports. Runs separately from queries." "Node.js · maintenance CLI"
            store = container "Versioned corpus" "Text, codes, metadata and hashes. corpus.json is bundled with Lambda. Not a remote vector database." "JSON files + snapshots"
            site = container "Page and policy" "Static demo content. Does not execute MCP searches." "HTML · S3 + CloudFront"
        }
        researcher -> client "Asks questions"
        client -> fiscal "Queries tools" "MCP / HTTPS"
        fiscal -> official "Collects documents during maintenance" "HTTPS"
        fiscal -> ollama "Requests vectors if configured" "Local HTTP / remote HTTPS"
        client -> runtime "Calls tools" "MCP / HTTPS"
        client -> site "Visits page and policy" "HTTPS"
        runtime -> store "Reads corpus at startup"
        ingest -> official "Downloads official editions" "HTTPS"
        ingest -> store "Writes corpus and snapshots"
        transport -> validation "Validates input and output"
        transport -> retrieval "search_regulations"
        transport -> codes "get_cfop / get_ncm"
        transport -> corpus "explain_rule"
        retrieval -> codes "Routes complete codes"
        retrieval -> corpus "Reads excerpts and relationships"
        retrieval -> embeddings "Embeds text and query"
        retrieval -> lexical "Searches words"
        retrieval -> vectors "Searches vectors"
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
