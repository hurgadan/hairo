import { Module } from "@nestjs/common";

import { LlmModelService } from "./llm-model.service";

@Module({
  providers: [LlmModelService],
  exports: [LlmModelService],
})
export class LlmModelModule {}
