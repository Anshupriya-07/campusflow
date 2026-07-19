const express = require('express');
const app = express();
const PORT = 5000;
const pool = require('./db');
async function logHistory(userId, action) {
  await pool.query('INSERT INTO history (user_id, action) VALUES ($1, $2)', [userId, action]);
}
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const bcrypt = require('bcrypt');
const redisClient = require('./redisClient');
const cron = require('node-cron');


app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.get('/', (req, res) => {
  res.send('CampusFlow server is running');
});

app.get('/test-db', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.send(result.rows[0]);
});

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User created
 */
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in and get a JWT token
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Returns JWT token
 */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Wrong password');
    // Update login streak
    const progressCheck = await pool.query('SELECT * FROM user_progress WHERE user_id=$1', [user.id]);
    if (progressCheck.rows.length === 0) {
      await pool.query('INSERT INTO user_progress (user_id, login_streak) VALUES ($1, 1)', [user.id]);
    } else {
      const lastUpdate = new Date(progressCheck.rows[0].updated_at);
      const today = new Date();
      const isNewDay = lastUpdate.toDateString() !== today.toDateString();
      if (isNewDay) {
        await pool.query(
          'UPDATE user_progress SET login_streak = login_streak + 1, updated_at = NOW() WHERE user_id=$1',
          [user.id]
        );
      }
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     responses:
 *       200:
 *         description: Returns user profile
 */
app.get('/profile', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId]);
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               due_date: { type: string }
 *     responses:
 *       201:
 *         description: Task created
 */
app.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, due_date } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, title, description, due_date]
    );
    await logHistory(req.userId, `Created task: ${title}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks for logged-in user
 *     responses:
 *       200:
 *         description: List of tasks
 */
app.get('/tasks', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
  res.json(result.rows);
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string }
 *               due_date: { type: string }
 *     responses:
 *       200:
 *         description: Task updated
 */
app.put('/tasks/:id', authMiddleware, async (req, res) => {
  const { title, description, status, due_date } = req.body;
  const result = await pool.query(
    'UPDATE tasks SET title=$1, description=$2, status=$3, due_date=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [title, description, status, due_date, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task deleted
 */
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.send('Task deleted');
});

// INTERNSHIPS
app.post('/internships', authMiddleware, async (req, res) => {
  const { company, role, status, applied_date } = req.body;
  const result = await pool.query(
    'INSERT INTO internships (user_id, company, role, status, applied_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.userId, company, role, status, applied_date]
  );
   await logHistory(req.userId, `Applied to ${company}`);
  res.status(201).json(result.rows[0]);
});

app.get('/internships', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM internships WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]);
  res.json(result.rows);
});

app.put('/internships/:id', authMiddleware, async (req, res) => {
  const { company, role, status, applied_date } = req.body;
  const result = await pool.query(
    'UPDATE internships SET company=$1, role=$2, status=$3, applied_date=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [company, role, status, applied_date, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

app.delete('/internships/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM internships WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.send('Internship deleted');
});

// HACKATHONS
app.post('/hackathons', authMiddleware, async (req, res) => {
  const { name, event_date, team_size, result: hackResult } = req.body;
  const result = await pool.query(
    'INSERT INTO hackathons (user_id, name, event_date, team_size, result) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.userId, name, event_date, team_size, hackResult]
  );
  await logHistory(req.userId, `Registered for hackathon: ${name}`);
  res.status(201).json(result.rows[0]);
});

app.get('/hackathons', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM hackathons WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]);
  res.json(result.rows);
});

app.put('/hackathons/:id', authMiddleware, async (req, res) => {
  const { name, event_date, team_size, result: hackResult } = req.body;
  const result = await pool.query(
    'UPDATE hackathons SET name=$1, event_date=$2, team_size=$3, result=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [name, event_date, team_size, hackResult, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

app.delete('/hackathons/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM hackathons WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.send('Hackathon deleted');
});

// NOTES
app.post('/notes', authMiddleware, async (req, res) => {
  const { title, content, subject } = req.body;
  const result = await pool.query(
    'INSERT INTO notes (user_id, title, content, subject) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.userId, title, content, subject]
  );
  res.status(201).json(result.rows[0]);
});

app.get('/notes', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM notes WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]);
  res.json(result.rows);
});

app.put('/notes/:id', authMiddleware, async (req, res) => {
  const { title, content, subject } = req.body;
  const result = await pool.query(
    'UPDATE notes SET title=$1, content=$2, subject=$3 WHERE id=$4 AND user_id=$5 RETURNING *',
    [title, content, subject, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

app.delete('/notes/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM notes WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.send('Note deleted');
});

// COMMENTS
app.post('/notes/:noteId/comments', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const result = await pool.query(
    'INSERT INTO comments (user_id, note_id, content) VALUES ($1,$2,$3) RETURNING *',
    [req.userId, req.params.noteId, content]
  );
  res.status(201).json(result.rows[0]);
});

app.get('/notes/:noteId/comments', authMiddleware, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM comments WHERE note_id=$1 ORDER BY created_at DESC',
    [req.params.noteId]
  );
  res.json(result.rows);
});

app.put('/comments/:id', authMiddleware, async (req, res) => {
  const { content } = req.body;
  const result = await pool.query(
    'UPDATE comments SET content=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [content, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

app.delete('/comments/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM comments WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.send('Comment deleted');
});

// RESUMES
app.post('/resumes', authMiddleware, async (req, res) => {
  const { resume_url } = req.body;
  const result = await pool.query(
    'INSERT INTO resumes (user_id, resume_url) VALUES ($1,$2) RETURNING *',
    [req.userId, resume_url]
  );
  res.status(201).json(result.rows[0]);
});

app.get('/resumes', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM resumes WHERE user_id=$1', [req.userId]);
  res.json(result.rows);
});

app.delete('/resumes/:id', authMiddleware, async (req, res) => {
  await pool.query('DELETE FROM resumes WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.send('Resume deleted');
});

// Get current user's progress
app.get('/progress', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM user_progress WHERE user_id=$1', [req.userId]);
  if (result.rows.length === 0) {
    // create default row if doesn't exist yet
    const created = await pool.query(
      'INSERT INTO user_progress (user_id) VALUES ($1) RETURNING *',
      [req.userId]
    );
    return res.json(created.rows[0]);
  }
  res.json(result.rows[0]);
});

// Update progress stats
app.put('/progress', authMiddleware, async (req, res) => {
  const { dsa_solved, subjects_completed, internship_applications, } = req.body;
  const result = await pool.query(
    `UPDATE user_progress 
     SET dsa_solved=$1, subjects_completed=$2, internship_applications=$3, updated_at=NOW() 
     WHERE user_id=$5 RETURNING *`,
    [dsa_solved, subjects_completed, internship_applications, req.userId]
  );
  res.json(result.rows[0]);
});

app.get('/history', authMiddleware, async (req, res) => {
  const result = await pool.query('SELECT * FROM history WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]);
  res.json(result.rows);
});


app.get('/leaderboard', authMiddleware, async (req, res) => {
  const cached = await redisClient.get('leaderboard');
  if (cached) {
    console.log('Serving from Redis cache');
    return res.json(JSON.parse(cached));
  }

  const result = await pool.query(`
    SELECT u.id, u.name, up.dsa_solved, up.internship_applications,
      COUNT(h.id) AS hackathons_count,
      (up.dsa_solved * 3 + up.internship_applications * 5 + COUNT(h.id) * 4 + login_streak * 2) AS score,
      RANK() OVER (ORDER BY (up.dsa_solved * 3 + up.internship_applications * 5 + COUNT(h.id) * 4 + up.login_streak * 2) DESC) AS rank
    FROM user_progress up
    JOIN users u ON u.id = up.user_id
    LEFT JOIN hackathons h ON h.user_id = u.id
    GROUP BY u.id, u.name, up.dsa_solved, up.internship_applications, up.login_streak
    ORDER BY rank ASC
    LIMIT 10
  `);

  await redisClient.setEx('leaderboard', 60, JSON.stringify(result.rows));
  console.log('Serving from PostgreSQL, cached now');
  res.json(result.rows);
});

// Check for upcoming deadlines and create notifications
app.post('/notifications/check', authMiddleware, async (req, res) => {
  const upcomingTasks = await pool.query(
    `SELECT * FROM tasks WHERE user_id=$1 AND due_date BETWEEN NOW() AND NOW() + INTERVAL '2 days'`,
    [req.userId]
  );

  for (const task of upcomingTasks.rows) {
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [req.userId, `Task due soon: ${task.title}`]
    );
  }

  res.send('Notifications checked and created');
});

// Get all notifications
app.get('/notifications', authMiddleware, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC',
    [req.userId]
  );
  res.json(result.rows);
});

// Mark as read
app.put('/notifications/:id/read', authMiddleware, async (req, res) => {
  await pool.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.send('Marked as read');
});

// Runs every hour, checks all users for upcoming deadlines
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled notification check...');
  const users = await pool.query('SELECT id FROM users');

  for (const user of users.rows) {
    const upcomingTasks = await pool.query(
      `SELECT * FROM tasks WHERE user_id=$1 AND due_date BETWEEN NOW() AND NOW() + INTERVAL '2 days'`,
      [user.id]
    );

    for (const task of upcomingTasks.rows) {
      // avoid duplicate notifications for same task
      const exists = await pool.query(
        `SELECT * FROM notifications WHERE user_id=$1 AND message=$2`,
        [user.id, `Task due soon: ${task.title}`]
      );
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
          [user.id, `Task due soon: ${task.title}`]
        );
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 