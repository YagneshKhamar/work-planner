import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { runInitialMigration } from './migrations/001_initial'

let db: Database.Database | null = null

function ensureConfigColumns(database: Database.Database): void {
  const alterStatements = [
    `ALTER TABLE config ADD COLUMN business_goal_count INTEGER NOT NULL DEFAULT 3`,
    `ALTER TABLE config ADD COLUMN personal_goal_count INTEGER NOT NULL DEFAULT 1`,
    `ALTER TABLE config ADD COLUMN family_goal_count INTEGER NOT NULL DEFAULT 1`,
  ]

  for (const statement of alterStatements) {
    try {
      database.exec(statement)
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      if (!message.includes('duplicate column name')) {
        throw error
      }
    }
  }
}

export function getDatabase(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'execd.db')
  db = new Database(dbPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runInitialMigration(db)
  ensureConfigColumns(db)

  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
