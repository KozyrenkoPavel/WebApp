CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  number TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  description TEXT
);

CREATE INDEX IF NOT EXISTS deals_date_idx ON deals(date);
CREATE INDEX IF NOT EXISTS deals_client_idx ON deals(client_id);