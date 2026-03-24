/**
 * Sprint MD Parser
 * ================
 * Parses sprint markdown files into structured data.
 * Understands: weeks, tasks, checkboxes, tags, checkpoints, dependencies, risks.
 */

/**
 * Parse a full sprint markdown string into structured data.
 * @param {string} md - Raw markdown content
 * @param {string} filename - Source filename
 * @returns {object} Parsed sprint object
 */
export function parseSprint(md, filename) {
  const lines = md.split('\n')

  const sprint = {
    filename,
    title: '',
    displayTitle: '',
    startDate: '',
    endDate: '',
    status: 'Başlamadı',
    weeks: [],
    dependencies: [],
    risks: [],
  }

  // ── Parse header metadata ──
  sprint.title = extractFirst(lines, /^#\s+(?:SPRINT:\s*)?(.+)/) || filename
  sprint.startDate = extractFirst(lines, /\*\*Başlangıç:\*\*\s*(.+)/) || ''
  sprint.endDate = extractFirst(lines, /\*\*Bitiş Hedefi?:\*\*\s*(.+?)(?:\s*\(|$)/) || ''
  sprint.status = extractFirst(lines, /\*\*Durum:\*\*\s*(.+)/) || 'Başlamadı'

  // ── Generate clean display title ──
  // "AY 0 + AY 1 — Detaylı Uygulama Planı" → extract highest month
  const monthMatch = sprint.title.match(/AY\s*(\d+)/gi)
  if (monthMatch) {
    const months = monthMatch.map(m => parseInt(m.replace(/AY\s*/i, '')))
    const maxMonth = Math.max(...months)
    const subtitle = sprint.title.replace(/^.*?—\s*/, '').trim()
    sprint.displayTitle = `Ay ${maxMonth}${subtitle ? ' — ' + subtitle : ''}`
  } else {
    sprint.displayTitle = sprint.title
  }

  // ── Split into sections by week headers ──
  const weekSections = splitByWeeks(lines)

  for (const section of weekSections) {
    const week = parseWeek(section)
    if (week) sprint.weeks.push(week)
  }

  // ── Parse dependencies ──
  sprint.dependencies = parseDependencies(lines)

  // ── Parse risk map ──
  sprint.risks = parseRiskMap(lines)

  return sprint
}

/**
 * Extract first regex match from lines
 */
function extractFirst(lines, regex) {
  for (const line of lines) {
    const m = line.match(regex)
    if (m) return m[1].trim()
  }
  return null
}

/**
 * Split lines into week sections based on "# HAFTA N" or "# ═══" patterns
 */
function splitByWeeks(lines) {
  const sections = []
  let current = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Week header: "# HAFTA 1 — ..." or "# ═══...HAFTA..."
    if (/^#\s*═+/.test(line)) {
      // Next non-separator line is the week title
      const titleLine = lines[i + 1]
      if (titleLine && /HAFTA\s+\d+/i.test(titleLine)) {
        if (current) sections.push(current)
        current = { titleLine: titleLine.replace(/^#\s*/, ''), lines: [], startIdx: i }
        i++ // skip title line
        continue
      }
      // Could be TAMPON or GENEL NOTLAR section
      if (titleLine && (/TAMPON/i.test(titleLine) || /GENEL/i.test(titleLine))) {
        if (current) sections.push(current)
        current = { titleLine: titleLine.replace(/^#\s*/, ''), lines: [], startIdx: i }
        i++
        continue
      }
    }
    if (current) {
      current.lines.push({ text: line, lineNum: i + 1 })
    }
  }
  if (current) sections.push(current)
  return sections
}

/**
 * Parse a week section into structured data
 */
function parseWeek(section) {
  const { titleLine, lines } = section

  // Extract week number
  const weekMatch = titleLine.match(/HAFTA\s+(\d+)/i)
  const weekNum = weekMatch ? parseInt(weekMatch[1]) : 0

  // Extract date range
  const dateMatch = titleLine.match(/(\d+[^—─]*(?:MART|NİSAN|MAYIS|HAZİRAN|TEMMUZ|AĞUSTOS|EYLÜL|EKİM|KASIM|ARALIK)[^—─]*)/i)
  const dateRange = dateMatch ? dateMatch[1].trim() : ''

  // Extract subtitle (after last —)
  const subtitleMatch = titleLine.match(/—\s*([^—]+)$/)
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : ''

  const week = {
    number: weekNum,
    title: titleLine.trim(),
    dateRange,
    subtitle,
    goal: '',
    items: [],
    checkpoint: null,
  }

  // Extract goal
  for (const { text } of lines) {
    const goalMatch = text.match(/\*\*Hedef:\*\*\s*(.+)/)
    if (goalMatch) {
      week.goal = goalMatch[1].trim()
      break
    }
  }

  // Split into sprint items (## headers)
  const items = splitByItems(lines)
  for (const item of items) {
    const parsed = parseItem(item)
    if (parsed) week.items.push(parsed)
  }

  // Parse checkpoint table
  week.checkpoint = parseCheckpoint(lines)

  return week
}

/**
 * Split week lines into individual sprint items by ## headers
 */
function splitByItems(lines) {
  const items = []
  let current = null

  for (const entry of lines) {
    const { text } = entry
    // Item header: "## [S] P0-4) ..." or "## [L] M1-G1) ..."
    if (/^##\s+\[/.test(text)) {
      if (current) items.push(current)
      current = { header: text, lines: [entry] }
    } else if (current) {
      current.lines.push(entry)
    }
  }
  if (current) items.push(current)
  return items
}

/**
 * Parse a single sprint item (e.g., P0-4, M1-G1)
 */
function parseItem(item) {
  const { header, lines } = item

  // Parse header: "## [S] P0-4) Grafik Ayarları Sorunu — 23 Mart ✅ TAMAMLANDI"
  const headerMatch = header.match(/^##\s+\[([SML])\]\s+([A-Z0-9\-]+)\)\s*(.+)/)
  if (!headerMatch) return null

  const size = headerMatch[1]
  const id = headerMatch[2]
  const rest = headerMatch[3]

  // Check if completed
  const isDone = /✅\s*TAMAMLANDI/i.test(rest)
  const titleClean = rest.replace(/\s*—\s*.+$/, '').replace(/✅\s*TAMAMLANDI/i, '').trim()

  // Extract completion date
  const dateMatch = rest.match(/—\s*(.+?)(?:\s*✅|$)/)
  const completionDate = dateMatch ? dateMatch[1].trim() : ''

  // Parse all tasks (checkbox lines)
  const tasks = []
  const tests = []
  const risks = []
  const decisions = []
  let inTestSection = false

  for (const { text, lineNum } of lines) {
    // Detect test section
    if (/^###\s*✅\s*Test/i.test(text)) {
      inTestSection = true
      continue
    }
    if (/^###/.test(text) && !/✅\s*Test/i.test(text)) {
      inTestSection = false
    }

    // Checkbox task
    const taskMatch = text.match(/^-\s+\[([ xX])\]\s*(.+)/)
    if (taskMatch) {
      const checked = taskMatch[1].toLowerCase() === 'x'
      const taskText = taskMatch[2].trim()

      // Extract owner tag
      const ownerMatch = taskText.match(/`\[(CLAUDE|DEV|DESIGN)\]`/)
      const owner = ownerMatch ? ownerMatch[1] : null

      // Clean text (remove owner tag)
      const cleanText = taskText.replace(/`\[(CLAUDE|DEV|DESIGN)\]`\s*/, '')

      // Check for risk marker
      const hasRisk = /⚠️/.test(taskText)
      if (hasRisk) risks.push(cleanText)

      const entry = { text: cleanText, checked, owner, lineNum, hasRisk }

      if (inTestSection) {
        tests.push(entry)
      } else {
        tasks.push(entry)
      }
    }

    // Decision points
    if (/🔒\s*KARAR/i.test(text)) {
      decisions.push(text.replace(/^>\s*/, '').trim())
    }
  }

  // Determine status
  let status = 'todo'
  const allCheckboxes = [...tasks, ...tests]
  if (isDone) {
    status = 'done'
  } else if (allCheckboxes.some(t => t.checked)) {
    status = 'in_progress'
  }

  // Total = tasks + tests combined. If item is "done" with 0 checkboxes, count as 1/1
  const totalAll = allCheckboxes.length
  const checkedAll = allCheckboxes.filter(t => t.checked).length
  const effectiveTotal = totalAll > 0 ? totalAll : (isDone ? 1 : 0)
  const effectiveChecked = totalAll > 0 ? checkedAll : (isDone ? 1 : 0)

  return {
    id,
    title: titleClean,
    size,
    status,
    completionDate,
    tasks,
    tests,
    risks,
    decisions,
    totalTasks: effectiveTotal,
    completedTasks: effectiveChecked,
  }
}

/**
 * Parse checkpoint table from week lines
 */
function parseCheckpoint(lines) {
  const checkpoint = {}
  let inCheckpoint = false

  for (const { text } of lines) {
    if (/📊.*KONTROL NOKTASI/i.test(text) || /HAFTA.*KONTROL/i.test(text)) {
      inCheckpoint = true
      continue
    }
    if (inCheckpoint && /^---/.test(text)) {
      break
    }
    if (inCheckpoint && /^\|/.test(text) && !/Madde|Hedef|---/.test(text)) {
      const cols = text.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 2) {
        checkpoint[cols[0]] = cols[1]
      }
    }
  }

  return Object.keys(checkpoint).length > 0 ? checkpoint : null
}

/**
 * Parse dependency map from sprint
 */
function parseDependencies(lines) {
  const deps = []
  let inDepSection = false

  for (const line of lines) {
    if (/Bağımlılık Haritası/i.test(line)) {
      inDepSection = true
      continue
    }
    if (inDepSection && /^```/.test(line)) {
      if (deps.length > 0) break
      continue
    }
    if (inDepSection && /──/.test(line)) {
      // Parse: "P0-1 (Rastgelelik) ──→ bağımsız ──→ M1-G4 (etiket)"
      const parts = line.split(/──+→/).map(p => p.trim())
      for (let i = 0; i < parts.length - 1; i++) {
        const fromId = extractId(parts[i])
        const toId = extractId(parts[i + 1])
        if (fromId && toId && toId !== 'bağımsız') {
          const label = parts[i + 1].replace(/[A-Z0-9\-]+\s*\([^)]*\)/, '').replace(/[()]/g, '').trim()
          deps.push({ from: fromId, to: toId, label: label || '' })
        }
      }
    }
  }

  return deps
}

/**
 * Parse risk map table
 */
function parseRiskMap(lines) {
  const risks = []
  let inRiskSection = false

  for (const line of lines) {
    if (/Risk Haritası/i.test(line)) {
      inRiskSection = true
      continue
    }
    if (inRiskSection && /^---/.test(line.trim()) && risks.length > 0) {
      break
    }
    if (inRiskSection && /^\|/.test(line) && !/Madde|Risk|Neden|---/.test(line)) {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 3) {
        const id = extractId(cols[0])
        const level = /🔴|Yüksek/i.test(cols[1]) ? 'high' : /🟡|Orta/i.test(cols[1]) ? 'medium' : 'low'
        risks.push({ item: id || cols[0], level, reason: cols[2] })
      }
    }
  }

  return risks
}

/**
 * Extract sprint item ID from text (e.g., "P0-4 (Ayarlar)" → "P0-4")
 */
function extractId(text) {
  const m = text.match(/([PM]\d+-[A-Z]?\d+[a-z]?)/i)
  return m ? m[1] : null
}

/**
 * Calculate overall sprint progress
 */
export function calcProgress(sprint) {
  let total = 0
  let done = 0

  for (const week of sprint.weeks) {
    for (const item of week.items) {
      total += item.totalTasks
      done += item.completedTasks
    }
  }

  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
}

/**
 * Calculate week progress
 */
export function calcWeekProgress(week) {
  let total = 0
  let done = 0

  for (const item of week.items) {
    total += item.totalTasks
    done += item.completedTasks
  }

  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
}
