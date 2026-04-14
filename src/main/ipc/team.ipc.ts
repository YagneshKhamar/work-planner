import { ipcMain } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../db/database'

export function registerTeamHandlers(): void {
  ipcMain.handle('team:get-members', () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM team_members WHERE active = 1 ORDER BY name').all()
  })

  ipcMain.handle('team:add-member', (_e, data: { name: string; role: string; email: string }) => {
    const db = getDatabase()
    const id = uuidv4()
    db.prepare(`INSERT INTO team_members (id, name, role, email) VALUES (?, ?, ?, ?)`).run(
      id,
      data.name,
      data.role,
      data.email,
    )
    return { success: true, id }
  })

  ipcMain.handle('team:remove-member', (_e, id: string) => {
    const db = getDatabase()
    db.prepare('UPDATE team_members SET active = 0 WHERE id = ?').run(id)
    return { success: true }
  })

  ipcMain.handle('team:get-tasks', (_e, memberId: string, weekStart: string) => {
    const db = getDatabase()
    return db
      .prepare(
        `
      SELECT tt.*, tm.name as member_name 
      FROM team_tasks tt
      JOIN team_members tm ON tm.id = tt.member_id
      WHERE tt.member_id = ? AND tt.week_start = ?
      ORDER BY tt.due_date ASC
    `,
      )
      .all(memberId, weekStart)
  })

  ipcMain.handle('team:get-all-tasks', (_e, weekStart: string) => {
    const db = getDatabase()
    return db
      .prepare(
        `
      SELECT tt.*, tm.name as member_name
      FROM team_tasks tt
      JOIN team_members tm ON tm.id = tt.member_id
      WHERE tt.week_start = ?
      ORDER BY tm.name ASC, tt.due_date ASC
    `,
      )
      .all(weekStart)
  })

  ipcMain.handle(
    'team:add-task',
    (
      _e,
      data: {
        member_id: string
        title: string
        description: string
        effort: string
        due_date: string
        week_start: string
      },
    ) => {
      const db = getDatabase()
      const id = uuidv4()
      db.prepare(
        `
      INSERT INTO team_tasks (id, member_id, title, description, effort, due_date, week_start)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        data.member_id,
        data.title,
        data.description,
        data.effort,
        data.due_date,
        data.week_start,
      )
      return { success: true, id }
    },
  )

  ipcMain.handle(
    'team:update-task-status',
    (_e, taskId: string, status: string, proofValue?: string) => {
      const db = getDatabase()
      db.prepare(
        `
      UPDATE team_tasks SET status = ?, proof_value = ?,
      completed_at = CASE WHEN ? = 'completed' THEN datetime('now') ELSE NULL END
      WHERE id = ?
    `,
      ).run(status, proofValue || null, status, taskId)
      db.prepare(
        `
      INSERT INTO team_task_logs (id, team_task_id, action)
      VALUES (?, ?, ?)
    `,
      ).run(uuidv4(), taskId, status)
      return { success: true }
    },
  )

  ipcMain.handle('team:add-note', (_e, taskId: string, note: string) => {
    const db = getDatabase()
    db.prepare('UPDATE team_tasks SET notes = ? WHERE id = ?').run(note, taskId)
    db.prepare(
      `
      INSERT INTO team_task_logs (id, team_task_id, action, note)
      VALUES (?, ?, 'note', ?)
    `,
    ).run(uuidv4(), taskId, note)
    return { success: true }
  })

  ipcMain.handle('team:get-followups', (_e, date: string) => {
    const db = getDatabase()
    return db
      .prepare(
        `
      SELECT tf.*, tm.name as member_name, tt.title as task_title
      FROM team_followups tf
      JOIN team_members tm ON tm.id = tf.member_id
      JOIN team_tasks tt ON tt.id = tf.team_task_id
      WHERE tf.scheduled_date = ? AND tf.done = 0
      ORDER BY tm.name ASC
    `,
      )
      .all(date)
  })

  ipcMain.handle(
    'team:add-followup',
    (
      _e,
      data: {
        member_id: string
        team_task_id: string
        note: string
        scheduled_date: string
      },
    ) => {
      const db = getDatabase()
      const id = uuidv4()
      db.prepare(
        `
      INSERT INTO team_followups (id, member_id, team_task_id, note, scheduled_date)
      VALUES (?, ?, ?, ?, ?)
    `,
      ).run(id, data.member_id, data.team_task_id, data.note, data.scheduled_date)
      return { success: true, id }
    },
  )

  ipcMain.handle('team:complete-followup', (_e, id: string) => {
    const db = getDatabase()
    db.prepare('UPDATE team_followups SET done = 1 WHERE id = ?').run(id)
    return { success: true }
  })

  ipcMain.handle('team:get-overdue', () => {
    const db = getDatabase()
    const today = new Date().toISOString().slice(0, 10)
    return db
      .prepare(
        `
      SELECT tt.*, tm.name as member_name,
        CAST(julianday(?) - julianday(tt.due_date) AS INTEGER) as days_overdue
      FROM team_tasks tt
      JOIN team_members tm ON tm.id = tt.member_id
      WHERE tt.status = 'pending' AND tt.due_date < ?
      ORDER BY days_overdue DESC
    `,
      )
      .all(today, today)
  })
}
