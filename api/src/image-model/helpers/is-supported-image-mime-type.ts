import { SupportedImageMimeType } from "../types";
import { SUPPORTED_IMAGE_MIME_TYPES } from "../constants";

export function isSupportedImageMimeType(
  value: string,
): value is SupportedImageMimeType {
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}
