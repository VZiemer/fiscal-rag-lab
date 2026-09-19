import { validateEmbeddings, type EmbeddingProvider } from '../../retrieval/src/embedding-provider.js';

/** Provider HTTP stays outside retrieval so model/vendor choices cannot change ranking policy. */
export class OllamaEmbeddingProvider implements EmbeddingProvider {
  constructor(readonly model: string, readonly dimensions: number,
    private readonly baseUrl = 'http://127.0.0.1:11434', private readonly request: typeof fetch = fetch) {
    if (!model.trim() || !Number.isSafeInteger(dimensions) || dimensions < 1) throw new Error('Model and dimensions required');
    const url = new URL(baseUrl);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid embedding endpoint');
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Remote embedding endpoint requires HTTPS');
  }
  async embed(texts: readonly string[]): Promise<Float32Array[]> {
    if (texts.length === 0) return [];
    if (texts.length > 128 || texts.some(text => !text.trim() || text.length > 32_000)) throw new Error('Invalid embedding batch');
    const response = await this.request(new URL('/api/embed', this.baseUrl), {
      method: 'POST', signal: AbortSignal.timeout(30_000), redirect: 'error',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.model, input: texts, truncate: false })
    });
    if (!response.ok) throw new Error(`Embedding provider failed: HTTP ${response.status}`);
    const data = await response.json() as { embeddings?: unknown };
    if (!Array.isArray(data.embeddings) || data.embeddings.some(row => !Array.isArray(row) || row.some(n => typeof n !== 'number'))) throw new Error('Malformed embedding response');
    const vectors = data.embeddings.map(row => new Float32Array(row));
    validateEmbeddings(vectors, texts.length, this.dimensions);
    return vectors;
  }
}
