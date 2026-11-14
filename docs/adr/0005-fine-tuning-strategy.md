# ADR-0005: Defer fine-tuning until we have a retrieval benchmark

- Status: **Accepted**
- Date: 2026-11-14

## Context

Fine-tuning a model with current statutes is not a robust update strategy. We must isolate whether improved answers come from retrieval, prompting, tool choice or model training.

## Decision

Initially use an existing LLM for grounded answer generation. Create held-out tests for tool selection, asking for missing context, citation correctness and abstention. Only then experiment with LoRA on an independently hosted/open-weight model and compare baseline vs. RAG vs. RAG+fine-tuning.

## Consequences

+ Measured causality and less premature model cost.
- Full model experimentation is a later milestone.

## Alternatives

Train first and hope it memorizes the rules (rejected for this use case).
