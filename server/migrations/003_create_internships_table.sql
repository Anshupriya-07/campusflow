CREATE TABLE internships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(150) NOT NULL,
  role VARCHAR(150),
  status VARCHAR(20) DEFAULT 'applied',
  applied_date DATE DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);