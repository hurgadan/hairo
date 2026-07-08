import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { createModel } from "./create-model";
import { GeminiModel } from "./gemini-model";

jest.mock("./gemini-model");

describe("createModel", () => {
  const MockedGeminiModel = jest.mocked(GeminiModel);

  beforeEach(() => {
    MockedGeminiModel.mockClear();
    MockedGeminiModel.itIsMe.mockReset();
  });

  const buildConfig = (model: string): ConfigService<AppConfig, true> =>
    ({
      getOrThrow: jest.fn().mockReturnValue(model),
    }) as unknown as ConfigService<AppConfig, true>;

  it("instantiates the model whose itIsMe matches", () => {
    MockedGeminiModel.itIsMe.mockReturnValue(true);
    const config = buildConfig("gemini-2.5-flash");

    const model = createModel(config);

    expect(model).toBeInstanceOf(MockedGeminiModel);
    expect(MockedGeminiModel).toHaveBeenCalledWith(config);
  });

  it("throws for a model no known ctor recognizes", () => {
    MockedGeminiModel.itIsMe.mockReturnValue(false);
    const config = buildConfig("unknown-model");

    expect(() => createModel(config)).toThrow("Unknown model: unknown-model");
  });
});
