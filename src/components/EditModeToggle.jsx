import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getToken, setToken, getRepo, setRepo } from '../lib/github'

export default function EditModeToggle({ editMode, onToggle }) {
  const [showSetup, setShowSetup] = useState(false)
  const [tokenInput, setTokenInput] = useState(getToken())
  const [repoInput, setRepoInput] = useState(getRepo())

  const handleActivate = () => {
    if (!getToken() || !getRepo()) {
      setShowSetup(true)
      return
    }
    onToggle(!editMode)
  }

  const handleSave = () => {
    setToken(tokenInput)
    setRepo(repoInput)
    setShowSetup(false)
    onToggle(true)
  }

  return (
    <>
      <button
        onClick={handleActivate}
        className={`game-panel-dim px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
          editMode
            ? 'text-green border-green/30 bg-green/[0.06]'
            : 'text-white/35 hover:text-gold/60'
        }`}
      >
        {editMode ? '✎ DÜZENLEME AÇIK' : '⊘ SALT OKUNUR'}
      </button>

      {/* Setup Modal */}
      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="game-panel p-5 w-full max-w-sm mx-4"
            >
              <h3 className="font-mono font-bold text-gold text-sm uppercase tracking-wider mb-1">
                GitHub Bağlantısı
              </h3>
              <p className="text-[11px] text-white/30 mb-4 font-mono">
                Task güncellemek için token gerekli. Sadece tarayıcında saklanır.
              </p>

              <label className="block text-[10px] font-mono font-bold text-gold/50 uppercase tracking-wider mb-1">
                Repository
              </label>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="kullanici/sprint-dashboard"
                className="w-full bg-black/50 border border-gold/20 rounded-[2px] px-3 py-2 text-sm font-mono text-white placeholder-white/15 focus:border-gold/50 focus:outline-none mb-3"
              />

              <label className="block text-[10px] font-mono font-bold text-gold/50 uppercase tracking-wider mb-1">
                Personal Access Token
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full bg-black/50 border border-gold/20 rounded-[2px] px-3 py-2 text-sm font-mono text-white placeholder-white/15 focus:border-gold/50 focus:outline-none mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSetup(false)}
                  className="flex-1 px-3 py-2 rounded-[2px] text-xs font-mono text-white/30 border border-white/10 hover:border-white/20"
                >
                  İPTAL
                </button>
                <button
                  onClick={handleSave}
                  disabled={!tokenInput || !repoInput}
                  className="flex-1 px-3 py-2 rounded-[2px] text-xs font-mono font-bold bg-gold text-dark-900 disabled:opacity-20 hover:bg-gold-bright"
                >
                  BAĞLAN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
