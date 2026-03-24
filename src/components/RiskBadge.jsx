export default function RiskBadge({ level, reason, className = '' }) {
  const config = {
    high: { border: 'border-red/40', text: 'text-red', icon: '▲', label: 'YÜKSEK RİSK', pulse: true },
    medium: { border: 'border-gold/40', text: 'text-gold', icon: '◆', label: 'ORTA RİSK', pulse: false },
    low: { border: 'border-green/40', text: 'text-green', icon: '●', label: 'DÜŞÜK RİSK', pulse: false },
  }

  const c = config[level] || config.low

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-dark-900/80 border ${c.border} rounded-[2px] ${className}`}
      title={reason}
    >
      <span className={`text-xs ${c.text} ${c.pulse ? 'animate-pulse-gold' : ''}`}>{c.icon}</span>
      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${c.text}`}>{c.label}</span>
      {reason && (
        <span className="text-[10px] text-white/30 max-w-52 truncate">— {reason}</span>
      )}
    </div>
  )
}
