CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  username TEXT NOT NULL,
  global_name TEXT,
  avatar TEXT,
  hidden BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  name TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  role TEXT NOT NULL,
  elevation INTEGER,
  frequency INTEGER NOT NULL,
  mqtt_uplink BOOLEAN NOT NULL
);
