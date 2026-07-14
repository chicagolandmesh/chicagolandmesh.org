CREATE TABLE nodes_new (
  id TEXT PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  name TEXT,
  public_key TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  elevation INTEGER,
  frequency FLOAT NOT NULL,
  power TEXT,
  device TEXT,
  protocol TEXT NOT NULL,
  role TEXT NOT NULL,
  mqtt_uplink BOOLEAN NOT NULL
);

INSERT INTO nodes_new (
  id,
  user_id,
  created_at,
  updated_at,
  name,
  latitude,
  longitude,
  elevation,
  frequency,
  power,
  protocol,
  role,
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
  elevation,
  906.875,
  CASE
    WHEN role = 'portable' THEN 'portable'
    ELSE 'hardwired'
  END AS power,
  'meshtastic',
  CASE
    WHEN role IN ('fixed', 'portable') THEN 'client'
    ELSE role
  END AS role,
  mqtt_uplink
FROM nodes;

DROP TABLE nodes;

ALTER TABLE nodes_new RENAME TO nodes;
