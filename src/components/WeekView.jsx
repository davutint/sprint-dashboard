import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from './ProgressBar'
import SprintItem from './SprintItem'
import { calcWeekProgress } from '../lib/parser'

export default function WeekView({ week, editMode, onToggle }) {
  const [expanded, setExpanded] = useState(true)
  const progress = calcWeekProgress(week)

  return (
    <div className="space-y-2">
      {/* Week Header — oyundaki Day paneli tarzı */}
      <button onClick={() => setExpanded(!expanded)} className="w-full group">
        <div className="game-panel p-4 flex items-center gap-4">
          {/* Week badge — hexagonal feel */}
          <div className="w-14 h-14 border-2 border-gold/40 bg-gold/[0.06] rounded-[3px] flex flex-col items-center justify-center shrink-0">
            {week.number > 0 ? (
              <>
                <span className="font-mono font-black text-gold text-sm leading-none">W{week.number}</span>
                <span className="text-[8px] text-gold/40 font-mono uppercase mt-0.5">HAFTA</span>
              </>
            ) : (
              <span className="text-lg">📦</span>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              {week.dateRange && (
                <span className="text-[10px] font-mono font-bold text-gold bg-gold/[0.08] border border-gold/20 px-2 py-0.5 rounded-[2px] uppercase tracking-wider">
                  {week.dateRange}
                </span>
              )}
              {week.subtitle && (
                <span className="text-sm font-bold text-white/85 uppercase tracking-wide">{week.subtitle}</span>
              )}
            </div>
            {week.goal && (
              <p className="text-xs text-white/30 mt-1.5 truncate">{week.goal}</p>
            )}
            <div className="mt-2.5">
              <ProgressBar percent={progress.percent} size="sm" showLabel={false} />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-sm font-bold text-gold/70">
              {progress.done}/{progress.total}
            </span>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              className="text-gold/30 text-xs"
            >
              ▼
            </motion.span>
          </div>
        </div>
      </button>

      {/* Week Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pl-5 border-l border-gold/10 ml-7 space-y-2">
              {week.items.map((item) => (
                <SprintItem
                  key={item.id}
                  item={item}
                  editMode={editMode}
                  onToggle={onToggle}
                />
              ))}

              {/* Checkpoint */}
              {week.checkpoint && (
                <div className="game-panel-dim p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider">
                      ◈ KONTROL NOKTASI
                    </span>
                    <span className="text-[9px] text-white/20 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded-[2px] font-mono uppercase">
                      HEDEF
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(week.checkpoint).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-white/45">{key}</span>
                        <span className="text-white/65 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
