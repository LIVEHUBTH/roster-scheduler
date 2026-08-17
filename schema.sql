CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_data_updated_at ON app_data(updated_at);
