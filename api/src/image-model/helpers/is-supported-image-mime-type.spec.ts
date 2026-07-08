import { isSupportedImageMimeType } from "./is-supported-image-mime-type";

describe("isSupportedImageMimeType", () => {
  it.each(["image/png", "image/jpeg", "image/webp"])(
    "returns true for %s",
    (mimeType) => {
      expect(isSupportedImageMimeType(mimeType)).toBe(true);
    },
  );

  it.each(["image/gif", "image/svg+xml", "application/pdf", ""])(
    "returns false for %s",
    (mimeType) => {
      expect(isSupportedImageMimeType(mimeType)).toBe(false);
    },
  );
});
