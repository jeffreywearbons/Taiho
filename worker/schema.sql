CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  catches INTEGER NOT NULL,
  level INTEGER NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  device TEXT NOT NULL,
  account TEXT,
  ts INTEGER NOT NULL,
  card TEXT,
  map INTEGER NOT NULL DEFAULT 0,   -- map index the run was played on
  week TEXT NOT NULL DEFAULT ''     -- ISO week key, e.g. 2026-W40, set by the server
);
CREATE INDEX IF NOT EXISTS scores_catches ON scores (catches DESC, ts ASC);
CREATE INDEX IF NOT EXISTS scores_map_week ON scores (map, week, catches DESC, ts ASC);
CREATE INDEX IF NOT EXISTS scores_device_ts ON scores (device, ts);
CREATE INDEX IF NOT EXISTS scores_account ON scores (account);

-- saves are keyed by owner: "d:<device>" or "a:<account>" (column name kept for compatibility)
CREATE TABLE IF NOT EXISTS saves (
  device TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,        -- apple | google | code
  sub TEXT NOT NULL,
  created INTEGER NOT NULL,
  UNIQUE (provider, sub)
);
CREATE TABLE IF NOT EXISTS devices (
  device TEXT PRIMARY KEY,
  account TEXT NOT NULL,
  linked INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS devices_account ON devices (account);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  account TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS purchases (
  owner TEXT NOT NULL,          -- a:<account> or d:<device>
  sku TEXT NOT NULL,
  platform TEXT NOT NULL,       -- stripe | app_store | play_store
  ref TEXT NOT NULL,            -- session / transaction id
  ts INTEGER NOT NULL,
  PRIMARY KEY (owner, sku)
);
CREATE TABLE IF NOT EXISTS codes (
  code TEXT PRIMARY KEY,
  account TEXT NOT NULL,
  expires INTEGER NOT NULL
);
