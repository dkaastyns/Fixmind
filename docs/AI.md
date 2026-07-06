# FixMind — AI Documentation

## Philosophy

AI is **advisory only**. Administrators assign technicians and set final priority. The system never auto-closes or auto-assigns based solely on AI output.

## Scope (MVP)

Two capabilities:

### 1. Priority Classification

**Input:** asset name, room name, description

**Output (JSON):**
```json
{
  "priority": "HIGH",
  "score": 78,
  "reason": "Water leak near electrical panel poses safety risk",
  "recommendation": "Shut off water supply and inspect piping",
  "estimatedRepairHours": 4,
  "suggestedAction": "Dispatch plumber and electrician within 4 hours"
}
```

### 2. Maintenance Recommendation

Included in the same JSON response above (`recommendation`, `estimatedRepairHours`, `suggestedAction`).

## Implementation

- **Module:** `backend/src/modules/ai/`
- **Provider:** Gemini 2.5 Flash via REST API
- **Trigger:** Async after report creation (to be wired in ReportsModule)
- **Failure mode:** `ai_analysis_status = FAILED`; report creation unaffected

## Configuration

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-2.5-flash
```

## Reliability

- 15s timeout per request
- Errors logged, null returned to caller
- `ai_usage_logs` table for cost monitoring (future wiring)

## Future: RAG Chatbot

- Table `knowledge_chunks` with `vector(768)` embeddings
- Similarity search via pgvector `<=>` operator
- SSE streaming to frontend
- No external vector DB for MVP

## Why not FastAPI?

See [DATABASE.md](./DATABASE.md#why-internal-aimodule-instead-of-fastapi). The `LlmProviderService` interface preserves option to extract to Python later.
