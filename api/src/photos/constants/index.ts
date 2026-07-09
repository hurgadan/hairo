export const PHOTOS_TABLE = "photos";

/** Префикс ключа в хранилище: photos/{userId}/{photoId}.{ext} */
export const PHOTO_STORAGE_PREFIX = "photos";

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Расширение файла по MIME для формирования ключа. */
export const PHOTO_MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
