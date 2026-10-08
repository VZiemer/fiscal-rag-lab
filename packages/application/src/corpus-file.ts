import type { Evidence } from '../../corpus/src/evidence.js';
import type { FiscalCode } from '../../fiscal-domain/src/code-repository.js';

/** Shared application DTO; persistence and transport adapters depend on it, never on each other. */
export interface CorpusFile { version: 1; evidence: Evidence[]; codes: FiscalCode[] }
