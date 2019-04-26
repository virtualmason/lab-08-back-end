DROP TABLE IF EXISTS weathers;
DROP TABLE IF EXISTS locations;

-- each specific location will be a row

-- columns
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_at BIGINT
);

CREATE TABLE weathers (
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time VARCHAR(255),
  location_id INTEGER NOT NULL,
  FOREIGN KEY(location_id) REFERENCES locations (id),
  created_at BIGINT
);