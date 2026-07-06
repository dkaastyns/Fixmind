import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PriorityAnalysisResult {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  reason: string;
  recommendation: string;
  estimatedRepairHours: number;
  suggestedAction: string;
}

@Injectable()
export class LlmProviderService {
  private readonly logger = new Logger(LlmProviderService.name);

  constructor(private readonly config: ConfigService) {}

  async analyzePriority(input: {
    assetName?: string;
    roomName: string;
    description: string;
  }): Promise<PriorityAnalysisResult | null> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — skipping AI analysis');
      return null;
    }

    const model = this.config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    const prompt = `You are a facility maintenance decision support system.
Analyze the report and respond ONLY with valid JSON (no markdown):
{
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "score": 0-100,
  "reason": "brief explanation",
  "recommendation": "maintenance recommendation",
  "estimatedRepairHours": number,
  "suggestedAction": "concrete next step"
}

Room: ${input.roomName}
Asset: ${input.assetName ?? 'Not specified'}
Description: ${input.description}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        this.logger.error(`Gemini API error: ${response.status}`);
        return null;
      }

      const body = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      return JSON.parse(text) as PriorityAnalysisResult;
    } catch (error) {
      this.logger.error('AI analysis failed', error);
      return null;
    }
  }

  async generateEmbedding(text: string): Promise<number[] | null> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) return null;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: { parts: [{ text }] },
          }),
        },
      );

      const body = await response.json();
      return body.embedding?.values ?? null;
    } catch (error) {
      this.logger.error('Embedding generation failed', error);
      return null;
    }
  }

  async generateChatResponse(prompt: string, context: string): Promise<string | null> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) return null;
    
    const model = this.config.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    const systemPrompt = `You are an expert facility maintenance AI assistant.
Use the following context from the knowledge base to answer the technician's question.
If the context doesn't contain the answer, say so. Do not invent information.

CONTEXT:
${context}
`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt + '\n\nQUESTION:\n' + prompt }] }
            ],
          }),
        }
      );

      const body = await response.json();
      return body.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      this.logger.error('Chat response generation failed', error);
      return null;
    }
  }
}
