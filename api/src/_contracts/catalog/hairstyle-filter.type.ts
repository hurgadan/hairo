import {
  FaceShape,
  GenderPresentation,
  HairDensity,
  HairLength,
  HairTexture,
} from "../enums";
import { Maintenance } from "./enums/maintenance.enum";
import { Occasion } from "./enums/occasion.enum";

export interface HairstyleFilter {
  /** Hard-фильтр — unisex-образы проходят при любом значении. */
  gender?: GenderPresentation;
  /** Hard-фильтр — целевая длина. */
  length?: HairLength;
  /** Hard-фильтр — потолок готовности к уходу (Low ≤ Medium ≤ High). */
  maintenance?: Maintenance;
  /** Soft-ранжирование. */
  faceShape?: FaceShape;
  texture?: HairTexture[];
  density?: HairDensity;
  occasion?: Occasion[];
}
