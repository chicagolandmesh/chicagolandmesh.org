CREATE TABLE nodes_old (
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

INSERT INTO nodes_old (
  id,
  user_id,
  created_at,
  updated_at,
  name,
  latitude,
  longitude,
  role,
  elevation,
  frequency,
  mqtt_uplink
)
SELECT
  id,
  user_id,
  created_at,
  updated_at,
  name,
  latitude,
  longitude,
  CASE
    WHEN power = 'portable' THEN 'portable'
    WHEN role IN ('router', 'repeater') THEN role
    WHEN power = 'hardwired' THEN 'fixed'
    ELSE 'fixed'
  END AS role,
  elevation,
  915,
  mqtt_uplink
FROM nodes;

DROP TABLE nodes;

ALTER TABLE nodes_old RENAME TO nodes;
