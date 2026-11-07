export class FixedWindowLimiter {
  private readonly clients = new Map<string, { used: number; resetAt: number }>();
  private nextCleanup = 0;
  constructor(readonly limit = 60, readonly windowMs = 60_000, readonly maxClients = 10_000) {
    if (![limit, windowMs, maxClients].every(n => Number.isSafeInteger(n) && n > 0)) throw new Error('Invalid rate limit');
  }
  allow(key: string, now = Date.now()): boolean {
    if (now >= this.nextCleanup) {
      for (const [id, entry] of this.clients) if (entry.resetAt <= now) this.clients.delete(id);
      this.nextCleanup = now + this.windowMs;
    }
    let entry = this.clients.get(key);
    if (!entry || entry.resetAt <= now) {
      if (!entry && this.clients.size >= this.maxClients) return false;
      entry = { used: 0, resetAt: now + this.windowMs }; this.clients.set(key, entry);
    }
    if (entry.used >= this.limit) return false;
    entry.used++; return true;
  }
}

export const privacyPolicy = `Privacy policy — Fiscal RAG Lab prototype (2026-11-14)
This service provides educational document research, not tax advice.
Do not include CPF/CNPJ identifiers, invoice XML, personal data or secrets in queries.
Queries and results are processed in memory and are not stored by the application.
Logs contain only a random request identifier, categorized route, status and duration; they exclude bodies, queries, IP addresses, headers and credentials.
Connection addresses are used only in memory for quotas and discarded when subsequent requests trigger window cleanup, without persistence.
The default embedding provider is local and lexical. Operators configuring remote embeddings must review and disclose the additional processing before publication.
Infrastructure, proxies and client platforms may apply their own policies. Operators must disclose their identity, contact details and infrastructure retention before opening a public demo.
The official corpus requires provenance and review; local demo data is synthetic and has no fiscal value.
`;
