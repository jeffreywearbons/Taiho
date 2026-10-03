ALTER TABLE scores ADD COLUMN account TEXT;
CREATE INDEX IF NOT EXISTS scores_account ON scores (account);
CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, provider TEXT NOT NULL, sub TEXT NOT NULL, created INTEGER NOT NULL, UNIQUE (provider, sub));
CREATE TABLE IF NOT EXISTS devices (device TEXT PRIMARY KEY, account TEXT NOT NULL, linked INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS devices_account ON devices (account);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, account TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS codes (code TEXT PRIMARY KEY, account TEXT NOT NULL, expires INTEGER NOT NULL);
-- existing anonymous saves move to the owner prefix
UPDATE saves SET device = 'd:' || device WHERE device NOT LIKE 'd:%' AND device NOT LIKE 'a:%';
