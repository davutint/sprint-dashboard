import { motion } from 'framer-motion'

export default function ProgressBar({ percent, size = 'md', showLabel = true, className = '' }) {
  const heights = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 ${heights[size]} xp-track overflow-hidden`}>
        <motion.div
          className="h-full xp-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-bold text-gold min-w-[3rem] text-right">
          {percent}%
        </span>
      )}
    </div>
  )
}
