import { useState, useEffect } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'

interface Task {
  id: string
  title: string
  effort: 'light' | 'medium' | 'heavy'
  status: 'pending' | 'completed' | 'carried' | 'dropped' | 'missed'
  proof_type: 'none' | 'comment' | 'link'
  carry_count: number
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function Overlay(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
    const interval = setInterval(loadTasks, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadTasks(): Promise<void> {
    try {
      const todayTasks = (await window.api.tasks.getByDate(getToday())) as Task[]
      setTasks(todayTasks)
    } catch (e) {
      console.error('Overlay failed to load tasks:', e)
    } finally {
      setLoading(false)
    }
  }

  const completed = tasks.filter((t) => t.status === 'completed').length
  const total = tasks.length
  const score = total > 0 ? Math.round((completed / total) * 100) : 0
  const pending = tasks.filter((t) => t.status === 'pending')

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="drag-region h-full flex flex-col bg-[#0d0d0d]/90 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden p-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`font-mono text-sm font-semibold ${
              score >= 80
                ? 'text-[var(--accent-green)]'
                : score >= 50
                  ? 'text-[var(--accent-yellow)]'
                  : 'text-[var(--accent-red)]'
            }`}
          >
            {score}%
          </span>
          <div className="no-drag flex items-center gap-1">
            <button
              onClick={() => window.api.overlay.hide()}
              className="no-drag text-white/20 hover:text-white/60 cursor-pointer transition-colors p-0.5"
              title="Minimize overlay"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.api.overlay.openMain()}
              className="no-drag text-white/20 hover:text-white/60 cursor-pointer transition-colors p-0.5"
              title="Open app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="no-drag h-0.5 rounded-full mb-3 overflow-hidden bg-white/5">
          <div
            className="h-full bg-[var(--accent-blue)] rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[10px] text-white/20 font-mono">loading...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[10px] text-white/20 font-mono">no tasks today</p>
          </div>
        ) : (
          <div className="flex-1 space-y-1 overflow-hidden">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-2 py-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    task.status === 'completed'
                      ? 'bg-[var(--accent-green)]'
                      : task.status === 'missed'
                        ? 'bg-[var(--accent-red)]'
                        : 'bg-white/20'
                  }`}
                />
                <p
                  className={`text-xs flex-1 truncate ${
                    task.status === 'completed' ? 'text-white/30 line-through' : 'text-white/80'
                  }`}
                >
                  {task.title}
                </p>
                <span className="font-mono text-[9px] text-white/20 shrink-0">
                  {task.effort === 'light' ? 'L' : task.effort === 'medium' ? 'M' : 'H'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 border-t border-white/[0.04] no-drag">
          <p className="font-mono text-[10px] text-white/20">
            {pending.length > 0 ? `${pending.length} remaining` : 'all done'}
          </p>
        </div>
      </div>
    </div>
  )
}
