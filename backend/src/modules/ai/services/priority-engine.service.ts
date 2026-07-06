import { Injectable } from '@nestjs/common';
import { LlmProviderService } from './llm-provider.service';

@Injectable()
export class PriorityEngineService {
  constructor(private readonly llm: LlmProviderService) {}

  async analyzeReport(input: {
    roomName: string;
    assetName?: string;
    description: string;
  }) {
    return this.llm.analyzePriority(input);
  }
}
