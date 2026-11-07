# ADR-0006: Libraries restricted to adapters

- Status: **Accepted**
- Date: 2026-11-14

ExcelJS 4.4.0 only decodes XLSX in the worker; Node types and TypeScript are build tools. We prefer a maintained parser over implementing spreadsheet ZIP/XML, avoiding formula execution and rejecting unsupported cells. Fiscal domain, corpus and retrieval do not depend on ExcelJS. Official files with changed schemas are rejected; mapping changes require fixtures and tests. Manually exported CSV is not treated as an original download.

Tests use synthetic spreadsheets with documented column contracts, without redistributing the official table. Each real edition still requires end-to-end validation before fiscal publication.

The `exceljs → uuid 11.1.1` override fixes GHSA-w5hq-g745-h8pq without downgrading the parser. ExcelJS's CommonJS `v4` API remains available; XLSX write/read tests verify integration. Review the override when ExcelJS updates its dependency.
