export default function TagBadge({ tag, className = '' }) {
  const styles = {
    S: 'bg-green/10 text-green border-green/30',
    M: 'bg-gold/10 text-gold border-gold/30',
    L: 'bg-red/10 text-red border-red/30',
  }

  const style = styles[tag] || 'bg-gold/10 text-gold/60 border-gold/20'

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-[2px] border ${style} ${className}`}>
      {tag}
    </span>
  )
}
