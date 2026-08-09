import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { uid } from '../lib/id.js';
import { serializeTask } from '../lib/serialize.js';

export const tasksRouter = Router();

const COLUMN_IDS = ['backlog', 'in-progress', 'review', 'done'];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

tasksRouter.get('/', async (req, res, next) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: 'teamId query param is required' });

    const result = await pool.query(
      'SELECT * FROM tasks WHERE team_id = $1 ORDER BY column_id, position',
      [teamId],
    );
    res.json(result.rows.map(serializeTask));
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const {
      teamId,
      columnId = 'backlog',
      title,
      description = '',
      assigneeId = null,
      priority = 'normal',
      dueDate = null,
      tags = [],
    } = req.body;

    if (!teamId || !title) return res.status(400).json({ error: 'teamId and title are required' });
    if (!COLUMN_IDS.includes(columnId)) return res.status(400).json({ error: 'invalid columnId' });
    if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'invalid priority' });

    const task = await withTransaction(async (client) => {
      const teamResult = await client.query('SELECT next_ticket FROM teams WHERE id = $1 FOR UPDATE', [
        teamId,
      ]);
      if (teamResult.rowCount === 0) throw Object.assign(new Error('team not found'), { status: 404 });
      const ticketNumber = teamResult.rows[0].next_ticket;
      await client.query('UPDATE teams SET next_ticket = next_ticket + 1 WHERE id = $1', [teamId]);

      const posResult = await client.query(
        'SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM tasks WHERE team_id = $1 AND column_id = $2',
        [teamId, columnId],
      );
      const position = posResult.rows[0].next_position;

      const id = uid('task');
      const insertResult = await client.query(
        `INSERT INTO tasks
           (id, team_id, ticket_number, column_id, title, description, assignee_id, priority, due_date, tags, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [id, teamId, ticketNumber, columnId, title, description, assigneeId, priority, dueDate, tags, position],
      );
      return insertResult.rows[0];
    });

    res.status(201).json(serializeTask(task));
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = ['title', 'description', 'assigneeId', 'priority', 'dueDate', 'tags', 'columnId'];
    const columnMap = {
      title: 'title',
      description: 'description',
      assigneeId: 'assignee_id',
      priority: 'priority',
      dueDate: 'due_date',
      tags: 'tags',
      columnId: 'column_id',
    };

    const sets = [];
    const values = [];
    let i = 1;
    for (const field of fields) {
      if (field in req.body) {
        sets.push(`${columnMap[field]} = $${i}`);
        values.push(req.body[field]);
        i += 1;
      }
    }
    if (sets.length === 0) return res.status(400).json({ error: 'no updatable fields provided' });

    values.push(id);
    const result = await pool.query(
      `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'task not found' });
    res.json(serializeTask(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'task not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Move a task into columnId, placing it directly before beforeTaskId
// (or at the end of the column when beforeTaskId is null/omitted).
tasksRouter.patch('/:id/move', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { columnId, beforeTaskId = null } = req.body;
    if (!COLUMN_IDS.includes(columnId)) return res.status(400).json({ error: 'invalid columnId' });

    const updated = await withTransaction(async (client) => {
      const movingResult = await client.query('SELECT * FROM tasks WHERE id = $1 FOR UPDATE', [id]);
      if (movingResult.rowCount === 0) throw Object.assign(new Error('task not found'), { status: 404 });
      const moving = movingResult.rows[0];

      const destResult = await client.query(
        `SELECT id FROM tasks WHERE team_id = $1 AND column_id = $2 AND id != $3 ORDER BY position FOR UPDATE`,
        [moving.team_id, columnId, id],
      );
      const destIds = destResult.rows.map((r) => r.id);

      const insertAt = beforeTaskId ? destIds.indexOf(beforeTaskId) : -1;
      if (insertAt === -1) {
        destIds.push(id);
      } else {
        destIds.splice(insertAt, 0, id);
      }

      for (let pos = 0; pos < destIds.length; pos += 1) {
        await client.query('UPDATE tasks SET position = $1, column_id = $2 WHERE id = $3', [
          pos,
          columnId,
          destIds[pos],
        ]);
      }

      const finalResult = await client.query('SELECT * FROM tasks WHERE id = $1', [id]);
      return finalResult.rows[0];
    });

    res.json(serializeTask(updated));
  } catch (err) {
    next(err);
  }
});
