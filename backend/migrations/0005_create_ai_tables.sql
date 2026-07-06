-- AI support: RAG knowledge base & usage tracking

CREATE TYPE knowledge_source AS ENUM ('FAQ', 'MANUAL', 'POLICY');

CREATE TABLE knowledge_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  source      knowledge_source NOT NULL DEFAULT 'FAQ',
  embedding   vector(768),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users (id) ON DELETE SET NULL,
  action        VARCHAR(80) NOT NULL,
  provider      VARCHAR(50) NOT NULL,
  model         VARCHAR(80) NOT NULL,
  tokens_input  INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HNSW index for fast cosine similarity search (pgvector)
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs (created_at DESC);
