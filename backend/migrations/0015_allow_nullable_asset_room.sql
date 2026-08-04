-- Allow assets to exist without a room (e.g. vehicles/mobil, garden pots, outdoor equipment)
ALTER TABLE assets ALTER COLUMN room_id DROP NOT NULL;
