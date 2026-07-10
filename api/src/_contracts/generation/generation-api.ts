import { ApiBase } from "../api-base";
import { CreateGeneration } from "./create-generation.type";
import { Generation } from "./generation.type";

export abstract class GenerationApi implements ApiBase {
  public readonly baseUrl = "/generation";

  // 202 Accepted — задание создано, результат ещё не готов. Фронт поллит `get`.
  protected abstract create(body: CreateGeneration): Promise<Generation>;
  protected abstract get(id: string): Promise<Generation>;
}
