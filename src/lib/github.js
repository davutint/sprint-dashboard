/**
 * GitHub API Helper
 * =================
 * Handles reading/writing sprint MD files via GitHub API.
 * Token stored in localStorage for persistence.
 */

const TOKEN_KEY = 'sprint_dashboard_gh_token'
const REPO_KEY = 'sprint_dashboard_gh_repo'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getRepo() {
  return localStorage.getItem(REPO_KEY) || ''
}

export function setRepo(repo) {
  localStorage.setItem(REPO_KEY, repo)
}

/**
 * Toggle a checkbox line in a sprint MD file via GitHub API.
 * @param {string} filePath - e.g., "sprints/SPRINT_AY0_AY1.md"
 * @param {number} lineNum - 1-based line number
 * @param {boolean} checked - new checkbox state
 */
export async function toggleCheckbox(filePath, lineNum, checked) {
  const token = getToken()
  const repo = getRepo()
  if (!token || !repo) throw new Error('GitHub token veya repo ayarlanmamış')

  const apiBase = `https://api.github.com/repos/${repo}/contents/${filePath}`

  // 1. Get current file
  const res = await fetch(apiBase, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Dosya okunamadı: ${res.status}`)

  const data = await res.json()
  const content = atob(data.content.replace(/\n/g, ''))
  const lines = content.split('\n')

  // 2. Toggle the checkbox on the specific line
  const idx = lineNum - 1
  if (idx < 0 || idx >= lines.length) throw new Error(`Geçersiz satır: ${lineNum}`)

  if (checked) {
    lines[idx] = lines[idx].replace('- [ ]', '- [x]')
  } else {
    lines[idx] = lines[idx].replace('- [x]', '- [ ]').replace('- [X]', '- [ ]')
  }

  // 3. Commit the change
  const newContent = btoa(unescape(encodeURIComponent(lines.join('\n'))))
  const commitRes = await fetch(apiBase, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `✅ Toggle: ${checked ? 'done' : 'undone'} (line ${lineNum})`,
      content: newContent,
      sha: data.sha,
    }),
  })

  if (!commitRes.ok) throw new Error(`Commit başarısız: ${commitRes.status}`)
  return true
}
