export interface SearchHit<T> {
  id: string;
  score: number;
  payload: T;
}

export interface VectorIndex<T> {
  add(id: string, vector: Float32Array, payload: T): void;
  search(query: Float32Array, k: number): SearchHit<T>[];
  size(): number;
}
