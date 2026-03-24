import { useState, useEffect } from 'react'
import { parseSprint } from '../lib/parser'

/**
 * Load and parse all sprint MD files from the sprints/ directory.
 * In production (GitHub Pages), fetches from the deployed files.
 * In dev, uses Vite's import.meta.glob.
 */
export function useSprints() {
  const [sprints, setSprints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSprints()
  }, [])

  async function loadSprints() {
    try {
      setLoading(true)

      // Fetch the sprint index file that lists all available sprints
      const base = import.meta.env.BASE_URL || '/'
      const indexRes = await fetch(`${base}sprints/index.json`)

      if (!indexRes.ok) {
        throw new Error('sprints/index.json bulunamadı')
      }

      const index = await indexRes.json()
      const parsed = []

      for (const file of index.files) {
        const res = await fetch(`${base}sprints/${file}`)
        if (res.ok) {
          const md = await res.text()
          parsed.push(parseSprint(md, file))
        }
      }

      // Sort: Aktif first, then Başlamadı, then Tamamlandı
      const statusOrder = { 'Aktif': 0, 'Başlamadı': 1, 'Tamamlandı': 2 }
      parsed.sort((a, b) => (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1))

      setSprints(parsed)
    } catch (err) {
      console.error('Sprint yükleme hatası:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { sprints, loading, error, reload: loadSprints }
}
