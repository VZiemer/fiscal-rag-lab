workspace "Fiscal RAG Lab" "Architecture of an educational fiscal RAG engine" {
    model {
        user = person "Researcher" "Asks about NF-e, CFOP and NCM rules"
        chat = softwareSystem "ChatGPT / other MCP client" "Runs the conversation and invokes read-only tools"
        official = softwareSystem "Official government sources" "NF-e portal, Receita Federal, state legislation and CONFAZ"
        embedding = softwareSystem "Embedding model provider" "Local model or external inference API"

        fiscal = softwareSystem "Fiscal RAG Lab" "Evidence-based research platform with custom retrieval indexes" {
            mcp = container "MCP gateway" "Read-only MCP tool adapter" "Node.js / TypeScript"
            app = container "Retrieval application" "Query routing, evidence assembly, fiscal lookups" "Node.js / TypeScript" {
                routing = component "Query router" "Chooses exact-code, lexical and semantic paths" "TypeScript"
                lexical = component "BM25 retriever" "Custom inverted index and term scoring" "TypeScript"
                vector = component "Vector retriever" "Custom exact, IVF and HNSW algorithms" "TypeScript"
                fusion = component "Ranking and evidence assembler" "Rank fusion, source filters and traceable excerpts" "TypeScript"
                rules = component "Fiscal lookup service" "Exact code lookup and missing-information checks" "TypeScript"
            }
            ingest = container "Ingestion worker" "Download, parse, chunk, embed and index source documents" "Node.js / TypeScript CLI"
            store = container "Corpus metadata store" "Document versions, legal hierarchy, code tables and provenance" "Versioned JSON + content-addressed snapshots"
            indexFiles = container "Index snapshot files" "Exact vector snapshots; BM25/IVF/HNSW rebuilt in memory" "Versioned JSON + in-memory indexes"
        }

        user -> chat "Asks natural language questions"
        chat -> mcp "Calls tools" "MCP over HTTPS"
        mcp -> app "Invokes read-only use cases" "In-process contract"
        app -> store "Reads facts and source metadata"
        app -> indexFiles "Searches locally"
        ingest -> official "Retrieves publicly available source releases" "HTTPS"
        ingest -> embedding "Requests embedding vectors" "Local inference / API"
        ingest -> store "Writes versioned source metadata"
        ingest -> indexFiles "Builds versioned index snapshots"
        routing -> lexical "Routes lexical queries"
        routing -> vector "Routes semantic queries"
        routing -> rules "Routes exact code lookups"
        lexical -> fusion "Submits ranked passages"
        vector -> fusion "Submits ranked passages"
        rules -> fusion "Submits sourced facts"
    }
    views {
        systemContext fiscal "context" {
            include *
            autoLayout lr
        }
        container fiscal "containers" {
            include *
            autoLayout lr
        }
        component app "retrieval-components" {
            include *
            autoLayout lr
        }
        styles {
            element "Person" { shape person }
            element "Software System" { background #1168bd; color #ffffff }
            element "Container" { background #438dd5; color #ffffff }
            element "Component" { background #85bbf0; color #000000 }
        }
    }
}
