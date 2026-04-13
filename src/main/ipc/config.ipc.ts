import { ipcMain } from 'electron'
import { getDatabase } from '../db/database'
import { v4 as uuidv4 } from 'uuid'

export function registerConfigHandlers(): void {
  ipcMain.handle(
    'config:save',
    (
      _event,
      data: {
        ai_provider: string
        api_key: string
        working_start: string
        working_end: string
        working_days: string[]
        break_start: string
        break_end: string
        business_goal_count: number
        personal_goal_count: number
        family_goal_count: number
        ollama_model?: string
        ollama_base_url?: string
        openrouter_model?: string
      },
    ) => {
      const db = getDatabase()

      const existing = db.prepare('SELECT id FROM config WHERE id = 1').get()

      if (existing) {
        db.prepare(
          `
        UPDATE config SET
          ai_provider = ?,
          api_key_encrypted = ?,
          working_start = ?,
          working_end = ?,
          working_days = ?,
          break_start = ?,
          break_end = ?,
          business_goal_count = ?,
          personal_goal_count = ?,
          family_goal_count = ?,
          ollama_model = ?,
          ollama_base_url = ?,
          openrouter_model = ?,
          updated_at = datetime('now')
        WHERE id = 1
      `,
        ).run(
          data.ai_provider,
          data.api_key,
          data.working_start,
          data.working_end,
          JSON.stringify(data.working_days),
          data.break_start,
          data.break_end,
          data.business_goal_count,
          data.personal_goal_count,
          data.family_goal_count,
          data.ollama_model ?? 'llama3',
          data.ollama_base_url ?? 'http://localhost:11434',
          data.openrouter_model ?? 'mistralai/mistral-7b-instruct',
        )
      } else {
        db.prepare(
          `
        INSERT INTO config (
          id, ai_provider, api_key_encrypted,
          working_start, working_end, working_days,
          break_start, break_end, business_goal_count,
          personal_goal_count, family_goal_count,
          ollama_model, ollama_base_url, openrouter_model
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        ).run(
          data.ai_provider,
          data.api_key,
          data.working_start,
          data.working_end,
          JSON.stringify(data.working_days),
          data.break_start,
          data.break_end,
          data.business_goal_count,
          data.personal_goal_count,
          data.family_goal_count,
          data.ollama_model ?? 'llama3',
          data.ollama_base_url ?? 'http://localhost:11434',
          data.openrouter_model ?? 'mistralai/mistral-7b-instruct',
        )
      }

      return { success: true }
    },
  )

  ipcMain.handle('config:get', () => {
    const db = getDatabase()
    const config = db.prepare('SELECT * FROM config WHERE id = 1').get()
    if (!config) return null

    const row = config as Record<string, unknown>
    let workingDays: string[] = ['mon', 'tue', 'wed', 'thu', 'fri']
    try {
      const parsed = JSON.parse(String(row.working_days ?? '[]')) as unknown
      if (Array.isArray(parsed) && parsed.every((day) => typeof day === 'string')) {
        workingDays = parsed
      }
    } catch {
      // Keep defaults when stored value is invalid.
    }

    return {
      ...row,
      working_days: workingDays,
      business_goal_count: Number(row.business_goal_count ?? 3),
      personal_goal_count: Number(row.personal_goal_count ?? 1),
      family_goal_count: Number(row.family_goal_count ?? 1),
      ollama_model: String(row.ollama_model ?? 'llama3'),
      ollama_base_url: String(row.ollama_base_url ?? 'http://localhost:11434'),
      openrouter_model: String(row.openrouter_model ?? 'mistralai/mistral-7b-instruct'),
    }
  })
}

// keep uuidv4 available for future use
export { uuidv4 }
