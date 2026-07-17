import { Module } from '@nestjs/common';
import { LlmProviderService } from './services/llm-provider.service';
import { PriorityEngineService } from './services/priority-engine.service';

@Module({
  providers: [LlmProviderService, PriorityEngineService],
  exports: [PriorityEngineService, LlmProviderService],
})
export class AiModule {}
