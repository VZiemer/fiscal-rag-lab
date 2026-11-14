# Fiscal domain (planned)

Pure domain types for transaction context (origin UF, destination UF, business regime, operation type, product NCM, effective date), rule provenance and deterministic validation. Domain code must not import LLM, MCP or HTTP dependencies.

The engine should return `missing_information` when an answer cannot be established. Never infer a tax rate solely from a semantically similar excerpt.
