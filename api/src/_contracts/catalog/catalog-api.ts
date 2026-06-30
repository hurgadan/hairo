import { ApiBase } from "../api-base";
import { Hairstyle } from "./hairstyle.type";

export abstract class CatalogApi implements ApiBase {
  public readonly baseUrl = "/catalog";

  protected abstract listHairstyles(): Promise<Hairstyle[]>;
  protected abstract getHairstyle(slug: string): Promise<Hairstyle>;
}
