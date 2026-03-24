import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TagBadge from './TagBadge'
import ProgressBar from './ProgressBar'
import TaskItem from './TaskItem'

export default function SprintItem({ item, editMode, onToggle }) {
  const [expanded, setExpanded] = useState(item.status === 'in_progress')
  const progress = item.totalTasks > 0 ? Math.round((item.completedTasks / item.totalTasks) * 100) : 0

  const statusConfig = {
    done: { border: 'border-l-green', icon: '✓', iconColor: 'text-green' },
    in_progress: { border: 'border-l-gold', icon: '►', iconColor: 'text-gold' },
    todo: { border: 'border-l-dark-500', icon: '○', iconColor: 'text-white/25' },
  }

  const sc = statusConfig[item.status]

  return (
    <div className={`game-panel-dim border-l-[3px] ${sc.border} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gold/[0.03] transition-colors"
      >
        {/* Status icon */}
        <span className={`font-mono font-bold text-sm w-5 text-center ${sc.iconColor}`}>{sc.icon}</span>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/90 font-semibold text-sm">{item.title}</span>
            <TagBadge tag={item.size} />
          </div>
          {/* Progress */}
          {item.totalTasks > 0 && (
            <div className="mt-2">
              <ProgressBar percent={progress} size="sm" showLabel={false} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.status === 'done' && item.completionDate && (
            <span className="text-[10px] text-green/60 font-mono hidden sm:block">{item.completionDate}</span>
          )}
          <span className="font-mono text-[11px] text-gold/60 bg-gold/[0.06] border border-gold/10 px-1.5 py-0.5 rounded-[2px]">
            {item.completedTasks}/{item.totalTasks}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="text-gold/30 text-[10px]"
          >
            ▼
          </motion.span>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="hazard-stripe-thin" />
            <div className="px-3 pb-3 pt-2 space-y-0.5">
              {/* Decisions */}
              {item.decisions.length > 0 && (
                <div className="mb-2 p-2 bg-gold/[0.04] border border-gold/15 rounded-[2px]">
                  <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider">◆ KARAR NOKTASI</span>
                  {item.decisions.map((d, i) => (
                    <p key={i} className="text-xs text-white/40 mt-1">{d}</p>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {item.tasks.map((task, i) => (
                <TaskItem key={i} task={task} editMode={editMode} onToggle={onToggle} />
              ))}

              {/* Tests */}
              {item.tests.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gold/8">
                  <span className="text-[10px] font-mono font-bold text-green/70 uppercase tracking-wider mb-1.5 block">
                    ✓ TEST SENARYOLARI
                  </span>
                  {item.tests.map((test, i) => (
                    <TaskItem key={`t-${i}`} task={test} editMode={editMode} onToggle={onToggle} />
                  ))}
                </div>
              )}

              {/* Risks */}
              {item.risks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gold/8">
                  {item.risks.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-red/70 py-0.5">
                      <span className="animate-pulse-gold">▲</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
