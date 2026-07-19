CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dsa_solved INTEGER DEFAULT 0,
  subjects_completed INTEGER DEFAULT 0,
  internship_applications INTEGER DEFAULT 0,
  attendance_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);