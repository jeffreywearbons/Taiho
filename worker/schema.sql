CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  catches INTEGER NOT NULL,
  level INTEGER NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  device TEXT NOT NULL,
  account TEXT,
  ts INTEGER NOT NULL,
  card TEXT
);
CREATE INDEX IF NOT EXISTS scores_catches ON scores (catches DESC, ts ASC);
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
CREATE TABLE IF NOT EXISTS codes (
  code TEXT PRIMARY KEY,
  account TEXT NOT NULL,
  expires INTEGER NOT NULL
);
