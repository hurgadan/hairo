// ВРЕМЕННО: локальная копия контракта `Photo`.
// TODO: заменить на импорт из `@hurgadan/hairo-contracts`, как только у токена
// появится scope `read:packages` (GitHub Packages) — локально и в CI.
export interface Photo {
  id: string;
  kind: string;
  status: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}
