import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { transformToDto } from "../../_common/utils/transform-to-dto";
import { HairstyleDto } from "../dto/hairstyle.dto";
import { CatalogService } from "../services/catalog.service";

@ApiTags("catalog")
@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("hairstyles")
  public async list(): Promise<HairstyleDto[]> {
    const items = await this.catalog.listHairstyles();
    return items.map((item) => transformToDto(HairstyleDto, item));
  }

  @Get("hairstyles/:slug")
  public async getOne(@Param("slug") slug: string): Promise<HairstyleDto> {
    const item = await this.catalog.getHairstyle(slug);
    return transformToDto(HairstyleDto, item);
  }
}
