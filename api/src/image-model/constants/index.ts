export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const SUPPORTED_IMAGE_SIZES = ["1K", "2K", "4K"] as const;

/** SDK-дефолт без явного imageSize — 1K, мало для "улучшения качества" фото. */
export const DEFAULT_IMAGE_SIZE = "2K";

export const SUPPORTED_ASPECT_RATIOS = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "9:16",
  "16:9",
  "21:9",
] as const;
