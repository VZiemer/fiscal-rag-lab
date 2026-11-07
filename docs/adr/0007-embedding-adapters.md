# ADR-0007: Local embeddings through a port

- Status: **Accepted**
- Date: 2026-11-14

`EmbeddingProvider` defines model, dimensions and batches. The Ollama adapter uses `POST /api/embed` with `truncate:false`, timeout and count/dimension/value validation. Reference: [official API](https://docs.ollama.com/api/embed). It adds no SDK and sends no data to remote services by default. Installing the runtime and downloading a model depends on the operator's environment; record name, digest and license for semantic evaluations.

An offline FNV-1a control over normalized terms enables tests and demos without a model. It produces lexical vectors, **not semantic embeddings**. Comparisons with this control do not measure language understanding. Indexes must not mix models or dimensions; the corpus manifest records both.
