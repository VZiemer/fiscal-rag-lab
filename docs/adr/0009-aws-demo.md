# ADR-0009: AWS demo with S3/CloudFront and a Lambda adapter

- Status: **Accepted**
- Date: 2026-11-14

Use S3 and CloudFront at the user's request. S3 distributes static content; MCP requires processing. An isolated HTTP API and Lambda provide the TypeScript runtime without a managed database or permanent server. The adapter converts HTTP v2 events into the official SDK's Request/Response interface. esbuild is only a packaging tool; algorithms and domain remain independent.

Initial content is a small editorial corpus with official-page hashes and unknown validity; do not claim a complete CFOP/NCM table that is not present. Gateway quotas and sanitized logs constrain operation. The account cannot reserve concurrency without exceeding its unreserved minimum; do not change other services' quotas. The origin header restricts backend access through the distribution; it is an operational secret, not user authentication. Plugin files contain no AWS credentials. LoRA training remains pending at the user's explicit direction.

Sharp is a development dependency used only during packaging to render existing vector icons into submission PNGs. It does not enter the Lambda bundle, domain, corpus or retrieval. The lockfile pins its version; tests check generated file formats and dimensions.

Documentation update on 2026-11-15: Sharp also renders C4 views to PNG from locally generated SVG. It remains a development tool with no effect on the research runtime. Model and reproduction instructions: [docs/c4](../c4/README.md).
