# FixMind — AI Documentation

## Philosophy

AI is **advisory only**. Administrators assign technicians and set final priority. The system never auto-closes or auto-assigns based solely on AI output.

## Scope

Two capabilities provided by AI analysis:

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

### 2. Maintenance Recommendation & Duration Estimation

Included in the same JSON response above (`recommendation`, `estimatedRepairHours`, `suggestedAction`).

## Implementation

- **Module:** `backend/src/modules/ai/`
- **Provider:** Google Gemini 2.5 Flash via REST API (with Groq AI Llama 3.1 fallback option)
- **Trigger:** Fully wired asynchronously in `ReportsService` immediately after report creation.
- **Failure Mode:** `ai_analysis_status = FAILED`; report creation is completely unaffected and proceeds safely.

## Configuration

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=optional-groq-key
```

## Reliability & Resiliency

- 15s timeout per request
- Errors logged gracefully, null returned on exception
- `ai_usage_logs` table records API execution metrics and token counts
