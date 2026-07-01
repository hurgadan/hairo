export interface Photo {
  id: string;
  /** Тип фото: 'selfie' (исходное селфи). Улучшённые/результаты — позже. */
  kind: string;
  /** Статус обработки: 'uploaded' (загружено). */
  status: string;
  contentType: string;
  sizeBytes: number;
  /** URL для отображения (CDN или presigned). Может протухать — не хранить долго. */
  url: string;
  createdAt: string;
}
