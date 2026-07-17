-- Migration: Drop knowledge_chunks table and knowledge_source enum (chatbot feature removed)

DROP TABLE IF EXISTS knowledge_chunks;
DROP TYPE IF EXISTS knowledge_source;
