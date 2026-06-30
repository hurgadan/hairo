import { LocalizedText } from "../localized-text.type";

export interface Hairstyle {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText | null;
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
