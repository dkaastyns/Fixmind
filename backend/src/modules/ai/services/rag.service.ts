import { Inject, Injectable, Logger } from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import { LlmProviderService } from './llm-provider.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @Inject(SQL_TOKEN) private readonly sql: Sql,
    private readonly llmProvider: LlmProviderService,
  ) {}

  async chat(prompt: string, userId: string): Promise<string> {
    try {
      // 1. Generate embedding for the user prompt
      const embedding = await this.llmProvider.generateEmbedding(prompt);
      if (!embedding) {
        throw new Error('Failed to generate embedding');
      }

      // Convert number array to vector string '[1, 2, ...]'
      const vectorStr = `[${embedding.join(',')}]`;

      // 2. Query top 3 most similar knowledge chunks
      const chunks = await this.sql<{ title: string; content: string; source: string; distance: number }[]>`
        SELECT title, content, source,
               embedding <=> ${vectorStr}::vector AS distance
        FROM knowledge_chunks
        ORDER BY embedding <=> ${vectorStr}::vector
        LIMIT 3
      `;

      // 3. Construct context
      let context = '';
      if (chunks.length > 0) {
        context = chunks
          .map((c) => `[Source: ${c.source} | Title: ${c.title}]\n${c.content}`)
          .join('\n\n');
      } else {
        context = 'No relevant information found in the knowledge base.';
      }

      // 4. Generate chat response
      const answer = await this.llmProvider.generateChatResponse(prompt, context);
      
      // 5. Log usage (optional, simplified)
      await this.sql`
        INSERT INTO ai_usage_logs (user_id, action, provider, model)
        VALUES (${userId}, 'chat', 'gemini', 'gemini-2.5-flash')
      `;

      return answer ?? 'Sorry, I could not generate an answer at this time.';
    } catch (error) {
      this.logger.error('Chat failed', error);
      return 'An error occurred while processing your question.';
    }
  }

  async seedKnowledge() {
    // Quick seeder for demonstration purposes
    const countRows = await this.sql<{ count: string }[]>`SELECT count(*) FROM knowledge_chunks`;
    if (!countRows.length || Number(countRows[0].count) > 0) return; // Already seeded

    this.logger.log('Seeding knowledge chunks...');
    
    const chunks = [
      {
        title: 'HVAC AC Unit Not Cooling',
        content: 'If the AC unit is running but not cooling, check the air filter first. A clogged filter restricts airflow. Next, check the condenser coils outside for dirt or debris. If both are clean, it may be low on refrigerant which requires a certified technician to refill.',
        source: 'FAQ',
      },
      {
        title: 'Leaking Pipe Temporary Fix',
        content: 'To temporarily fix a leaking pipe, first shut off the main water valve. Dry the pipe completely. Apply epoxy putty or a pipe clamp over the leak. Do not use electrical tape as it will not hold water pressure. Schedule a permanent repair as soon as possible.',
        source: 'MANUAL',
      },
      {
        title: 'Electrical Panel Tripping',
        content: 'If a circuit breaker keeps tripping, do not force it to stay on. It indicates an overloaded circuit, a short circuit, or a ground fault. Unplug all devices on that circuit and try resetting. If it trips immediately with nothing plugged in, the breaker itself or the wiring is faulty.',
        source: 'FAQ',
      }
    ];

    for (const chunk of chunks) {
      const embedding = await this.llmProvider.generateEmbedding(chunk.content);
      if (embedding) {
        const vectorStr = `[${embedding.join(',')}]`;
        await this.sql`
          INSERT INTO knowledge_chunks (title, content, source, embedding)
          VALUES (${chunk.title}, ${chunk.content}, ${chunk.source}::knowledge_source, ${vectorStr}::vector)
        `;
      }
    }
  }
}
