import 'dotenv/config';
import { pool, withTransaction } from './db.js';
import { ensureSchema } from './schema.js';
import { uid } from './lib/id.js';

function iso(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await ensureSchema();

  const existing = await pool.query('SELECT COUNT(*)::int AS n FROM teams');
  if (existing.rows[0].n > 0) {
    console.log('Database already has data — skipping seed. Delete rows manually if you want to reseed.');
    await pool.end();
    return;
  }

  await withTransaction(async (client) => {
    const members = [
      { id: uid('m'), name: 'Priya Nair', initials: 'PN', color: '#2F8F8B' },
      { id: uid('m'), name: 'Marcus Reid', initials: 'MR', color: '#C85A45' },
      { id: uid('m'), name: 'Sofia Alvarez', initials: 'SA', color: '#D89A34' },
      { id: uid('m'), name: 'Kenji Watanabe', initials: 'KW', color: '#3C5FDB' },
      { id: uid('m'), name: 'Ada Osei', initials: 'AO', color: '#7A5FC0' },
    ];
    for (const m of members) {
      await client.query('INSERT INTO members (id, name, initials, color) VALUES ($1, $2, $3, $4)', [
        m.id,
        m.name,
        m.initials,
        m.color,
      ]);
    }

    const engTeamId = uid('team');
    const mktTeamId = uid('team');
    await client.query('INSERT INTO teams (id, name, prefix, next_ticket) VALUES ($1, $2, $3, $4)', [
      engTeamId,
      'Product Engineering',
      'ENG',
      16,
    ]);
    await client.query('INSERT INTO teams (id, name, prefix, next_ticket) VALUES ($1, $2, $3, $4)', [
      mktTeamId,
      'Marketing',
      'MKT',
      6,
    ]);

    const engMembers = [members[0], members[1], members[2], members[3]];
    const mktMembers = [members[2], members[4]];
    for (const m of engMembers) {
      await client.query('INSERT INTO team_members (team_id, member_id) VALUES ($1, $2)', [engTeamId, m.id]);
    }
    for (const m of mktMembers) {
      await client.query('INSERT INTO team_members (team_id, member_id) VALUES ($1, $2)', [mktTeamId, m.id]);
    }

    const tasks = [
      { teamId: engTeamId, ticket: 12, col: 'in-progress', title: 'Rebuild onboarding checklist flow', desc: 'Replace the modal-based flow with an inline stepper on the dashboard.', assignee: members[0].id, priority: 'high', due: iso(3), tags: ['frontend'], pos: 0, created: iso(-6) },
      { teamId: engTeamId, ticket: 13, col: 'backlog', title: 'Investigate flaky checkout webhook tests', desc: 'CI has failed intermittently on the payments suite for the past week.', assignee: members[1].id, priority: 'urgent', due: iso(1), tags: ['bug', 'ci'], pos: 0, created: iso(-2) },
      { teamId: engTeamId, ticket: 14, col: 'backlog', title: 'Add dark mode token set', desc: 'Extend the design tokens with a parallel dark palette for the settings page.', assignee: null, priority: 'low', due: null, tags: ['design'], pos: 1, created: iso(-1) },
      { teamId: engTeamId, ticket: 15, col: 'review', title: 'API rate limit headers', desc: 'Add X-RateLimit-* headers to all public endpoints and document them.', assignee: members[3].id, priority: 'normal', due: iso(5), tags: ['api'], pos: 0, created: iso(-4) },
      { teamId: engTeamId, ticket: 9, col: 'done', title: 'Migrate logging to structured JSON', desc: 'All services now emit structured logs consumed by the new pipeline.', assignee: members[3].id, priority: 'normal', due: null, tags: ['infra'], pos: 0, created: iso(-10) },
      { teamId: mktTeamId, ticket: 4, col: 'in-progress', title: 'Draft Q3 launch newsletter', desc: 'First pass copy for the September feature launch, needs a review pass.', assignee: members[2].id, priority: 'high', due: iso(2), tags: ['copy'], pos: 0, created: iso(-3) },
      { teamId: mktTeamId, ticket: 5, col: 'backlog', title: 'Refresh partner one-pager', desc: 'Update the numbers and case studies in the partner deck.', assignee: members[4].id, priority: 'low', due: iso(10), tags: ['sales'], pos: 0, created: iso(-1) },
    ];

    for (const t of tasks) {
      await client.query(
        `INSERT INTO tasks
           (id, team_id, ticket_number, column_id, title, description, assignee_id, priority, due_date, tags, position, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [uid('task'), t.teamId, t.ticket, t.col, t.title, t.desc, t.assignee, t.priority, t.due, t.tags, t.pos, t.created],
      );
    }
  });

  console.log('Seeded demo teams, members, and tasks.');
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
