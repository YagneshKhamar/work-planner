import React, { useEffect, useMemo, useState } from 'react'
import { Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'

interface GoalItem {
  id: string
  title: string
  type: 'business' | 'personal' | 'family'
  ai_validated: number
  ai_validation_note: string
}

interface SubgoalItem {
  id: string
  goal_id: string
  title: string
  priority: 'high' | 'medium' | 'low'
}

const TYPE_BADGE: Record<GoalItem['type'], string> = {
  business:
    'font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20',
  personal:
    'font-mono text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20',
  family:
    'font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)] border border-[var(--accent-green)]/20',
}

const PRIORITY_BADGE: Record<SubgoalItem['priority'], string> = {
  high: 'font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-red)]/10 text-[var(--accent-red)] border border-[var(--accent-red)]/20',
  medium:
    'font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-yellow)]/10 text-[var(--accent-yellow)] border border-[var(--accent-yellow)]/20',
  low: 'font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--border-default)]/30 text-[var(--text-secondary)] border border-[var(--border-default)]',
}

const PRIORITY_DOT: Record<SubgoalItem['priority'], string> = {
  high: 'bg-[var(--accent-red)]',
  medium: 'bg-[var(--accent-yellow)]',
  low: 'bg-[var(--border-active)]',
}

export default function MonthlyPlan(): React.JSX.Element {
  const navigate = useNavigate()
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [subgoalMap, setSubgoalMap] = useState<Record<string, SubgoalItem[]>>({})
  const [loading, setLoading] = useState(true)
  const { error } = useToast()

  const month = useMemo(() => new Date().toISOString().slice(0, 7), [])
  const monthLabel = useMemo(
    () =>
      new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [month],
  )

  useEffect(() => {
    async function loadMonthPlan(): Promise<void> {
      try {
        setLoading(true)
        const fetchedGoals = (await window.api.goals.get(month)) as GoalItem[]
        setGoals(fetchedGoals)

        const subgoalsByGoal = await Promise.all(
          fetchedGoals.map(
            (goal) => window.api.subgoals.getByGoal(goal.id) as Promise<SubgoalItem[]>,
          ),
        )

        const mappedSubgoals: Record<string, SubgoalItem[]> = {}
        fetchedGoals.forEach((goal, index) => {
          mappedSubgoals[goal.id] = subgoalsByGoal[index]
        })

        setSubgoalMap(mappedSubgoals)
      } catch {
        error('Failed to load monthly plan.')
      } finally {
        setLoading(false)
      }
    }

    loadMonthPlan()
  }, [error, month])

  if (loading) {
    return (
      <div className="h-full w-full overflow-y-auto bg-[var(--bg-base)] flex items-center justify-center">
        <p className="text-sm text-[var(--text-muted)] font-mono">loading...</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--bg-base)]">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-mono text-xs tracking-widest text-[var(--text-muted)] uppercase mb-1">
              PLAN
            </p>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Monthly Plan</h1>
          </div>
          <p className="font-mono text-sm text-[var(--text-muted)]">{monthLabel}</p>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Target className="w-8 h-8 text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              No goals set for this month.
            </p>
            <button
              onClick={() => navigate('/goals')}
              className="text-sm text-[var(--accent-blue)] hover:text-blue-300 cursor-pointer"
            >
              Set goals
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const subgoals = subgoalMap[goal.id] ?? []
              return (
                <div
                  key={goal.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden"
                >
                  <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
                    <div className="flex items-center">
                      <span className={TYPE_BADGE[goal.type]}>{goal.type}</span>
                      <p className="text-sm font-medium text-[var(--text-primary)] ml-3">
                        {goal.title}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-[var(--text-muted)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="px-5 py-3 space-y-2">
                    {subgoals.length > 0 ? (
                      subgoals.map((subgoal) => (
                        <div key={subgoal.id} className="flex items-center gap-3 py-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[subgoal.priority]}`}
                          />
                          <p className="text-sm text-[var(--text-secondary)] flex-1">
                            {subgoal.title}
                          </p>
                          <span className={PRIORITY_BADGE[subgoal.priority]}>
                            {subgoal.priority}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--text-muted)] py-2">No subgoals yet.</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
