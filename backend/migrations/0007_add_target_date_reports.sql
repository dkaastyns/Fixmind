ALTER TABLE reports 
ADD COLUMN target_completion_date TIMESTAMPTZ,
ADD COLUMN ai_suggested_target_date TIMESTAMPTZ;
