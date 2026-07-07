import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PriorityAnalysisResult {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  reason: string;
  recommendation: string;
  estimatedRepairHours: number;
  suggestedAction: string;
  suggestedTargetDate?: string;
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
    const prompt = `Anda adalah sistem pendukung keputusan pemeliharaan fasilitas.
Analisis laporan dan berikan respons HANYA dengan JSON valid (tanpa markdown). Gunakan bahasa Indonesia untuk isian teks:
{
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "score": 0-100,
  "reason": "penjelasan singkat",
  "recommendation": "rekomendasi pemeliharaan",
  "estimatedRepairHours": angka,
  "suggestedAction": "langkah selanjutnya yang konkret",
  "suggestedTargetDate": "Tanggal target selesai (ISO 8601 string) disesuaikan dengan urgensi"
}

Waktu saat ini (sebagai referensi): ${new Date().toISOString()}
Ruangan: ${input.roomName}
Aset: ${input.assetName ?? 'Tidak disebutkan'}
Deskripsi: ${input.description}`;

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/gemini-embedding-2',
            content: { parts: [{ text }] },
            outputDimensionality: 768,
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
    const systemPrompt = `Anda adalah asisten AI ahli pemeliharaan fasilitas.
Gunakan konteks berikut dari basis pengetahuan untuk menjawab pertanyaan teknisi. Jawab dalam bahasa Indonesia.
Jika konteks tidak berisi jawaban, katakan demikian. Jangan mengarang informasi.

KONTEKS:
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
              { role: 'user', parts: [{ text: systemPrompt + '\n\nPERTANYAAN:\n' + prompt }] }
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
