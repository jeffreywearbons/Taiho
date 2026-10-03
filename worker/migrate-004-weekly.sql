-- Weekly rankings split by map. Existing rows count as map 0 (Konbini) in the week they were posted.
ALTER TABLE scores ADD COLUMN map INTEGER NOT NULL DEFAULT 0;
ALTER TABLE scores ADD COLUMN week TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS scores_map_week ON scores (map, week, catches DESC, ts ASC);
