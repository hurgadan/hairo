// ВРЕМЕННО: локальная копия контракта `Hairstyle`.
// TODO: заменить на импорт из `@hurgadan/hairo-contracts`, как только у токена
// появится scope `read:packages` (GitHub Packages) — локально и в CI.
export interface Hairstyle {
  id: string;
  slug: string;
  name: { ru?: string; en?: string; es?: string; de?: string };
  description: { ru?: string; en?: string; es?: string; de?: string } | null;
  groupName: string;
  length: string;
  genderPresentation: string;
  texture: string[];
  fringe: string | null;
  maintenance: string;
  aesthetic: string[];
  occasion: string[];
  previewImage: string | null;
}
