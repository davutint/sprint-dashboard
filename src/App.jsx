import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSprints } from './hooks/useSprints'
import SprintCard from './components/SprintCard'
import WeekView from './components/WeekView'
import DependencyGraph from './components/DependencyGraph'
import RiskBadge from './components/RiskBadge'
import ProgressBar from './components/ProgressBar'
import EditModeToggle from './components/EditModeToggle'
import { toggleCheckbox } from './lib/github'
import { calcProgress } from './lib/parser'

export default function App() {
  const { sprints, loading, error } = useSprints()
  const [activeSprint, setActiveSprint] = useState(null)
  const [editMode, setEditMode] = useState(false)

  const selected = activeSprint !== null ? activeSprint : 0
  const sprint = sprints[selected]

  const handleToggle = async (lineNum, checked) => {
    if (!sprint) return
    await toggleCheckbox(`sprints/${sprint.filename}`, lineNum, checked)
  }

  const allItems = sprint?.weeks.flatMap(w => w.items) || []
  const progress = sprint ? calcProgress(sprint) : { percent: 0, done: 0, total: 0 }

  return (
    <div className="min-h-screen bg-grid scan-line relative">

      {/* ═══ Top HUD Bar — oyundaki Day + Currency bar tarzı ═══ */}
      <header className="sticky top-0 z-40 bg-dark-900/95 border-b border-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Left — Day panel style */}
          <div className="flex items-center gap-4">
            <div className="game-panel px-4 py-2">
              <span className="font-mono font-black text-gold text-sm tracking-wide">SPRINT DASHBOARD</span>
            </div>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest hidden sm:block">
              Narco Check
            </span>
          </div>

          {/* Right — XP bar style stats + edit toggle */}
          <div className="flex items-center gap-4">
            {sprint && (
              <div className="hidden md:flex items-center gap-3">
                {/* Progress chip */}
                <div className="flex items-center gap-2 game-panel-dim px-3 py-1.5">
                  <span className="text-[10px] font-mono text-white/30 uppercase">İlerleme</span>
                  <div className="w-24">
                    <ProgressBar percent={progress.percent} size="sm" showLabel={false} />
                  </div>
                  <span className="font-mono font-bold text-gold text-xs">{progress.percent}%</span>
                </div>
                {/* Task counter */}
                <div className="game-panel-dim px-3 py-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/30">GÖREV</span>
                  <span className="font-mono font-bold text-gold text-xs">{progress.done}/{progress.total}</span>
                </div>
              </div>
            )}
            <EditModeToggle editMode={editMode} onToggle={setEditMode} />
          </div>
        </div>
        <div className="hazard-stripe" />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative">
        {/* ═══ Loading ═══ */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full mx-auto mb-4"
              />
              <p className="text-xs font-mono text-gold/40 uppercase tracking-wider">Yükleniyor...</p>
            </div>
          </div>
        )}

        {/* ═══ Error ═══ */}
        {error && (
          <div className="game-panel p-8 text-center max-w-md mx-auto">
            <span className="text-red font-mono font-bold text-sm">▲ HATA</span>
            <p className="text-white/40 text-xs mt-2 font-mono">{error}</p>
          </div>
        )}

        {/* ═══ Empty ═══ */}
        {!loading && !error && sprints.length === 0 && (
          <div className="game-panel p-16 text-center max-w-md mx-auto">
            <p className="font-mono font-bold text-gold text-sm uppercase">Sprint dosyası bulunamadı</p>
            <p className="text-white/25 text-xs mt-2 font-mono">sprints/ klasörüne MD dosyası ekle</p>
          </div>
        )}

        {/* ═══ Dashboard ═══ */}
        {!loading && sprint && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* ─── Sidebar ─── */}
            <div className="lg:col-span-1 space-y-2">
              <h2 className="text-[10px] font-mono font-bold text-gold/40 uppercase tracking-[0.2em] mb-2 px-1">
                Sprint'ler
              </h2>
              {sprints.map((s, i) => (
                <SprintCard
                  key={s.filename}
                  sprint={s}
                  isActive={i === selected}
                  onClick={() => setActiveSprint(i)}
                />
              ))}
            </div>

            {/* ─── Main ─── */}
            <div className="lg:col-span-3 space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={sprint.filename}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* ─── Sprint Hero ─── */}
                  <div className="game-panel p-5 mb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-wide">
                          {sprint.displayTitle}
                        </h2>
                        <p className="text-xs font-mono text-white/25 mt-1">
                          {sprint.startDate} → {sprint.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black font-mono text-gold">{progress.percent}%</span>
                        <p className="text-[10px] font-mono text-gold/40 uppercase">tamamlandı</p>
                      </div>
                    </div>
                    <ProgressBar percent={progress.percent} size="lg" showLabel={false} />
                  </div>

                  {/* ─── Risks ─── */}
                  {sprint.risks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {sprint.risks.map((r, i) => (
                        <RiskBadge key={i} level={r.level} reason={`${r.item}: ${r.reason}`} />
                      ))}
                    </div>
                  )}

                  {/* ─── Weeks ─── */}
                  <div className="space-y-5">
                    {sprint.weeks.map((week, i) => (
                      <WeekView key={i} week={week} editMode={editMode} onToggle={handleToggle} />
                    ))}
                  </div>

                  {/* ─── Dependencies ─── */}
                  {sprint.dependencies.length > 0 && (
                    <div className="mt-6">
                      <DependencyGraph dependencies={sprint.dependencies} items={allItems} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="mt-12">
        <div className="hazard-stripe" />
        <div className="py-4 text-center">
          <p className="text-[10px] font-mono text-white/10 uppercase tracking-widest">
            Sprint Dashboard — Narco Check
          </p>
        </div>
      </footer>
    </div>
  )
}
