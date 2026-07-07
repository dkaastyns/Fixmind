ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS target_completion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_suggested_target_date TIMESTAMPTZ;
