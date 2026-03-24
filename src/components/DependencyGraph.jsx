import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Dependency graph — game HUD styled layered flow diagram.
 */
export default function DependencyGraph({ dependencies, items }) {
  const layout = useMemo(() => {
    if (!dependencies || dependencies.length === 0) return null
    return computeLayout(dependencies, items)
  }, [dependencies, items])

  if (!layout) return null

  const { nodes, edges, width, height } = layout

  return (
    <div className="game-panel p-4 overflow-x-auto">
      <h3 className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider mb-4">◈ BAĞIMLILIK HARİTASI</h3>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minHeight: 180 }}>
        <defs>
          <marker id="arr-done" viewBox="0 -4 8 8" refX="7" refY="0" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,-3.5L7,0L0,3.5" fill="#4ADE80" opacity="0.7" />
          </marker>
          <marker id="arr-wip" viewBox="0 -4 8 8" refX="7" refY="0" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,-3.5L7,0L0,3.5" fill="#F5C518" opacity="0.7" />
          </marker>
          <marker id="arr-todo" viewBox="0 -4 8 8" refX="7" refY="0" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,-3.5L7,0L0,3.5" fill="#555" opacity="0.7" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const mid = edge.status === 'done' ? 'done' : edge.status === 'in_progress' ? 'wip' : 'todo'
          const color = statusColors[edge.status] || '#555'
          return (
            <motion.path
              key={i}
              d={edge.path}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeOpacity="0.35"
              strokeDasharray={edge.status === 'todo' ? '4 3' : 'none'}
              markerEnd={`url(#arr-${mid})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node, i) => {
          const color = statusColors[node.status] || '#555'
          return (
            <motion.g
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <rect
                x={node.x - node.w / 2}
                y={node.y - node.h / 2}
                width={node.w}
                height={node.h}
                rx="2"
                fill="#0a0a0a"
                stroke={color}
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
              {/* Status indicator bar at left */}
              <rect
                x={node.x - node.w / 2}
                y={node.y - node.h / 2}
                width="3"
                height={node.h}
                rx="1"
                fill={color}
                opacity="0.7"
              />
              <text
                x={node.x + 2}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontFamily="'Inter', sans-serif"
                fontWeight="600"
                opacity="0.8"
              >
                {node.label}
              </text>
            </motion.g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 text-[10px] font-mono text-white/30 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-[1px]" style={{ background: '#4ADE80' }} /> Tamamlandı
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-[1px]" style={{ background: '#F5C518' }} /> Devam Ediyor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-[1px]" style={{ background: '#555' }} /> Bekliyor
        </span>
      </div>
    </div>
  )
}

const statusColors = {
  done: '#4ADE80',
  in_progress: '#F5C518',
  todo: '#555555',
}

function computeLayout(dependencies, items) {
  const nodeIds = new Set()
  const inEdges = {}
  const outEdges = {}

  dependencies.forEach(d => {
    nodeIds.add(d.from)
    nodeIds.add(d.to)
    if (!outEdges[d.from]) outEdges[d.from] = []
    outEdges[d.from].push(d.to)
    if (!inEdges[d.to]) inEdges[d.to] = []
    inEdges[d.to].push(d.from)
  })

  const itemMap = {}
  if (items) items.forEach(it => { itemMap[it.id] = it })

  const layers = {}
  const visited = new Set()

  function assignLayer(id, depth) {
    if (visited.has(id)) {
      layers[id] = Math.max(layers[id] || 0, depth)
      return
    }
    visited.add(id)
    layers[id] = Math.max(layers[id] || 0, depth)
    ;(outEdges[id] || []).forEach(to => assignLayer(to, depth + 1))
  }

  const roots = [...nodeIds].filter(id => !inEdges[id] || inEdges[id].length === 0)
  roots.forEach(id => assignLayer(id, 0))
  ;[...nodeIds].forEach(id => { if (!visited.has(id)) assignLayer(id, 0) })

  const layerGroups = {}
  Object.entries(layers).forEach(([id, layer]) => {
    if (!layerGroups[layer]) layerGroups[layer] = []
    layerGroups[layer].push(id)
  })

  const nodeW = 150
  const nodeH = 34
  const colGap = 70
  const rowGap = 14
  const padX = 30
  const padY = 25

  const maxLayer = Math.max(...Object.keys(layerGroups).map(Number))
  const maxNodesInLayer = Math.max(...Object.values(layerGroups).map(g => g.length))

  const svgWidth = (maxLayer + 1) * (nodeW + colGap) + padX * 2
  const svgHeight = maxNodesInLayer * (nodeH + rowGap) + padY * 2

  const nodePositions = {}
  const nodes = []

  for (let layer = 0; layer <= maxLayer; layer++) {
    const group = layerGroups[layer] || []
    const totalH = group.length * nodeH + (group.length - 1) * rowGap
    const startY = (svgHeight - totalH) / 2

    group.forEach((id, idx) => {
      const x = padX + layer * (nodeW + colGap) + nodeW / 2
      const y = startY + idx * (nodeH + rowGap) + nodeH / 2

      nodePositions[id] = { x, y }

      const item = itemMap[id]
      const title = item?.title || id
      const label = title.length > 16 ? title.substring(0, 15) + '…' : title

      nodes.push({ id, x, y, w: nodeW, h: nodeH, label, status: item?.status || 'todo' })
    })
  }

  const edges = dependencies.map(d => {
    const from = nodePositions[d.from]
    const to = nodePositions[d.to]
    if (!from || !to) return null

    const x1 = from.x + nodeW / 2
    const y1 = from.y
    const x2 = to.x - nodeW / 2
    const y2 = to.y
    const midX = (x1 + x2) / 2
    const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`

    const targetItem = itemMap[d.to]
    return { path, status: targetItem?.status || 'todo' }
  }).filter(Boolean)

  return { nodes, edges, width: svgWidth, height: svgHeight }
}
