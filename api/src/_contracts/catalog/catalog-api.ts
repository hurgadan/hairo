import { ApiBase } from "../api-base";
import { Hairstyle } from "./hairstyle.type";
import { HairstyleFilter } from "./hairstyle-filter.type";

export abstract class CatalogApi implements ApiBase {
  public readonly baseUrl = "/catalog";

  protected abstract listHairstyles(
    filter?: HairstyleFilter,
  ): Promise<Hairstyle[]>;
  protected abstract getHairstyle(slug: string): Promise<Hairstyle>;
}
