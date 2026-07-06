import { Module } from '@nestjs/common';
import { LlmProviderService } from './services/llm-provider.service';
import { PriorityEngineService } from './services/priority-engine.service';

import { AiController } from './ai.controller';
import { RagService } from './services/rag.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AiController],
  providers: [LlmProviderService, PriorityEngineService, RagService],
  exports: [PriorityEngineService, LlmProviderService, RagService],
})
export class AiModule {}
