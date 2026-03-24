import { useState } from 'react'

export default function TaskItem({ task, editMode, onToggle }) {
  const [optimistic, setOptimistic] = useState(null)
  const isChecked = optimistic !== null ? optimistic : task.checked

  const handleToggle = async () => {
    if (!editMode) return
    const newState = !isChecked
    setOptimistic(newState)
    try {
      await onToggle(task.lineNum, newState)
    } catch (err) {
      setOptimistic(null)
      console.error('Toggle failed:', err)
    }
  }

  return (
    <div
      className={`group flex items-start gap-3 py-1.5 px-2 rounded-[2px] transition-colors ${
        isChecked ? 'opacity-45' : ''
      } ${editMode ? 'hover:bg-gold/[0.04] cursor-pointer' : ''}`}
      onClick={editMode ? handleToggle : undefined}
    >
      <input
        type="checkbox"
        className="task-checkbox mt-0.5"
        checked={isChecked}
        readOnly={!editMode}
        onChange={editMode ? handleToggle : undefined}
        onClick={(e) => e.stopPropagation()}
      />

      <span className={`text-sm leading-relaxed ${
        isChecked
          ? 'line-through text-white/25'
          : 'text-white/75'
      }`}>
        {task.text}
      </span>

      {task.hasRisk && (
        <span className="text-xs text-red animate-pulse-gold ml-auto shrink-0" title="Risk">▲</span>
      )}
    </div>
  )
}
