import type { Photo } from "@hurgadan/hairo-contracts";

/** Текущее загруженное селфи — доступно последующим шагам флоу. */
export function useCurrentPhoto() {
  return useState<Photo | null>("current-photo", () => null);
}

export function usePhotos() {
  const config = useRuntimeConfig();
  const { ensureGuest } = useAuth();
  const current = useCurrentPhoto();

  async function upload(file: File, consent: boolean): Promise<Photo> {
    const token = await ensureGuest();

    const form = new FormData();
    form.append("file", file);
    form.append("consent", String(consent));

    const photo = await $fetch<Photo>(`${config.public.apiBase}/photos`, {
      method: "POST",
      body: form,
      headers: { authorization: `Bearer ${token}` },
    });

    current.value = photo;
    return photo;
  }

  return { upload, current };
}
