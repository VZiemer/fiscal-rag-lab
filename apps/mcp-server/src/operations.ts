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

export const privacyPolicy = `Política de privacidade — protótipo Fiscal RAG Lab (14/11/2026)
Este serviço oferece pesquisa documental educativa, não parecer tributário.
Não envie CPF, CNPJ, XML de notas, dados pessoais ou segredos nas consultas.
Consultas e resultados são processados em memória e não são armazenados pela aplicação.
Logs registram somente identificador aleatório de requisição, rota categorizada, status e duração; não incluem corpo, consulta, IP, cabeçalhos ou credenciais.
Endereços de conexão são usados somente em memória para quotas e descartados na limpeza das janelas, acionada por requisições posteriores, sem persistência.
O provedor padrão de embeddings é lexical e local. Um operador que configure embeddings remotos deverá revisar e divulgar o tratamento adicional antes de publicar.
Infraestrutura, proxy e plataforma cliente podem aplicar políticas próprias. O operador deverá informar identidade, contato e retenção da infraestrutura antes de abrir a demonstração pública.
O corpus oficial exige procedência e revisão; os dados da demonstração local são sintéticos e sem valor fiscal.
`;
