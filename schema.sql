DROP TABLE IF EXISTS weathers;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS movies;




-- each specific location will be a row

-- columns
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7)
);

CREATE TABLE weathers (
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time VARCHAR(255),
  location_id INTEGER NOT NULL,
  FOREIGN KEY(location_id) REFERENCES locations (id)
);

CREATE TABLE movies ( 
  id SERIAL PRIMARY KEY, 
  title VARCHAR(255), 
  overview VARCHAR(1000), 
  average_votes NUMERIC(4,2), 
  total_votes INTEGER, 
  image_url VARCHAR(255), 
  popularity NUMERIC(6,4), 
  released_on CHAR(10),
  created_at BIGINT,
  location_id INTEGER NOT NULL REFERENCES locations(id) 
);

