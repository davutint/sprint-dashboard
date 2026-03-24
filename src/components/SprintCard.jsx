import { motion } from 'framer-motion'
import ProgressBar from './ProgressBar'
import { calcProgress } from '../lib/parser'

export default function SprintCard({ sprint, isActive, onClick }) {
  const progress = calcProgress(sprint)

  const statusConfig = {
    'Aktif': { label: '► AKTİF', color: 'text-green', border: 'border-green/30', bg: 'bg-green/8' },
    'Tamamlandı': { label: '✓ BİTTİ', color: 'text-gold', border: 'border-gold/30', bg: 'bg-gold/8' },
    'Başlamadı': { label: '○ BEKLEMEDE', color: 'text-white/40', border: 'border-white/10', bg: 'bg-white/3' },
  }

  const config = statusConfig[sprint.status] || statusConfig['Başlamadı']

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-4 transition-all ${
        isActive ? 'game-panel-active' : 'game-panel'
      }`}
    >
      {/* Status */}
      <span className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] border mb-3 ${config.color} ${config.border} ${config.bg}`}>
        {config.label}
      </span>

      {/* Title */}
      <h3 className="font-bold text-white/85 text-sm mb-1 uppercase tracking-wide">{sprint.displayTitle}</h3>

      {/* Dates */}
      <p className="text-[11px] font-mono text-white/30 mb-3">
        {sprint.startDate} → {sprint.endDate}
      </p>

      {/* XP Bar style progress */}
      <ProgressBar percent={progress.percent} size="md" />

      {/* Stats */}
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
        <span className="text-white/30">{sprint.weeks.length} HAFTA</span>
        <span className="text-gold/60">{progress.done}/{progress.total}</span>
      </div>
    </motion.button>
  )
}
