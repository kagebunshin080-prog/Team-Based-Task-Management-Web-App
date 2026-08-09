import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ensureSchema } from './schema.js';
import { teamsRouter } from './routes/teams.js';
import { membersRouter } from './routes/members.js';
import { tasksRouter } from './routes/tasks.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/teams', teamsRouter);
app.use('/api/members', membersRouter);
app.use('/api/tasks', tasksRouter);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
});

const port = process.env.PORT ?? 4000;

ensureSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Ledger API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to set up database schema:', err);
    process.exit(1);
  });
