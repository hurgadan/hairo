import { SUPPORTED_ASPECT_RATIOS, SUPPORTED_IMAGE_SIZES } from "../constants";

export type SupportedImageSize = (typeof SUPPORTED_IMAGE_SIZES)[number];
export type SupportedAspectRatio = (typeof SUPPORTED_ASPECT_RATIOS)[number];
