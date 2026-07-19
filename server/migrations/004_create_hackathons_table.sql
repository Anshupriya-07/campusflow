CREATE TABLE hackathons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  event_date DATE,
  team_size INTEGER,
  result VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);