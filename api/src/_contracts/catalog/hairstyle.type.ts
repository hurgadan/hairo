import { GenderPresentation, HairLength, HairTexture } from "../enums";
import { LocalizedText } from "../localized-text.type";
import { Aesthetic } from "./enums/aesthetic.enum";
import { Fringe } from "./enums/fringe.enum";
import { Maintenance } from "./enums/maintenance.enum";
import { Occasion } from "./enums/occasion.enum";

export interface Hairstyle {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText | null;
  groupName: string;
  length: HairLength;
  genderPresentation: GenderPresentation;
  texture: HairTexture[];
  fringe: Fringe | null;
  maintenance: Maintenance;
  aesthetic: Aesthetic[];
  occasion: Occasion[];
  previewImage: string | null;
  /** 0–100, null если ни один ranking-параметр фильтра не передан. */
  matchScore: number | null;
}
