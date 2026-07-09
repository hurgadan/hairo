import { ApiBase } from "../api-base";
import { BodyStartAnalysis } from "./body-start-analysis.type";
import { PhotoAnalysis } from "./photo-analysis.type";

export abstract class FaceAnalysisApi implements ApiBase {
  public readonly baseUrl = "/face-analysis";

  // 202 Accepted — задание создано, результат ещё не готов. Фронт поллит `get`.
  protected abstract start(body: BodyStartAnalysis): Promise<PhotoAnalysis>;
  protected abstract get(id: string): Promise<PhotoAnalysis>;
}
