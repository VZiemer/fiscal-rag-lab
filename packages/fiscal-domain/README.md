# Fiscal domain

`FiscalRuleRepository` and `InMemoryFiscalRepository` implement exact CFOP/NCM lookup, editions and validity intervals. Canonical formatting is accepted; partial or approximate codes are rejected. Records are copied defensively. Overlapping editions return ambiguity rather than silently selecting one text.

Results distinguish found records, absence from the corpus, insufficient evidence and ambiguity. `missingContext` identifies the date, origin/destination states, regime and transaction needed to discuss applicability; lookup does not decide transaction tax treatment. No rate is inferred from a description or text similarity. There is no invoice issuer or tax calculator.

This module does not import MCP, HTTP or model SDKs. XLSX/JSON parsers belong to the ingestion adapter. A corpus without a matching code returns absence from that corpus, not a claim that the code does not legally exist.
