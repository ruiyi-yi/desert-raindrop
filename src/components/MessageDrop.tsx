import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'desert-raindrop-message';

const MessageDrop: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isWriting, setIsWriting] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMessage(saved);
  }, []);

  const handleSave = () => {
    if (!draft.trim()) return;
    localStorage.setItem(STORAGE_KEY, draft.trim());
    setMessage(draft.trim());
    setIsWriting(false);
    setDraft('');
  };

  return (
    <motion.div
      className="relative flex flex-col items-center py-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <AnimatePresence mode="wait">
        {message ? (
          /* Already has a message → show it */
          <motion.div
            key="saved"
            className="glass rounded-2xl px-6 py-4 max-w-xs text-center shadow-soft"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-center gap-1 mb-2">
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                <path d="M5 13C5 13 0 7 0 4.5C0 2 2.2 0 5 0C7.8 0 10 2 10 4.5C10 7 5 13 5 13Z"
                  fill="rgba(126,200,227,0.5)" />
              </svg>
            </div>
            <p className="text-diary text-xs md:text-sm text-ink/70 leading-[2] whitespace-pre-wrap">
              {message}
            </p>
            <button
              onClick={() => { localStorage.removeItem(STORAGE_KEY); setMessage(null); }}
              className="mt-3 text-subtle text-[9px] tracking-[0.1em] text-ink-light/30 hover:text-ink-light/50 transition-colors"
            >
              清除，重新写一滴
            </button>
          </motion.div>
        ) : isWriting ? (
          /* Writing mode */
          <motion.div
            key="writing"
            className="glass rounded-2xl px-6 py-5 max-w-xs w-full shadow-soft"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="在这滴雨里留下你想说的话…"
              className="w-full bg-transparent text-diary text-xs md:text-sm text-ink/70 leading-[2] resize-none outline-none placeholder:text-ink-light/25 min-h-[80px]"
              autoFocus
              maxLength={300}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-subtle text-[9px] text-ink-light/25">{draft.length}/300</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsWriting(false); setDraft(''); }}
                  className="text-subtle text-[10px] tracking-[0.1em] text-ink-light/35 hover:text-ink-light/60 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={!draft.trim()}
                  className="glass-blue rounded-full px-4 py-1 text-subtle text-[10px] tracking-[0.1em] text-sky-deep/60 hover:text-sky-deep/80 disabled:opacity-30 transition-colors"
                >
                  留下
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty state → invite to write */
          <motion.button
            key="empty"
            onClick={() => setIsWriting(true)}
            className="glass rounded-full flex flex-col items-center gap-1 px-4 py-3 shadow-soft hover:shadow-glass-hover transition-shadow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="12" height="16" viewBox="0 0 10 14" fill="none" className="opacity-30">
              <path d="M5 14C5 14 0 7.5 0 5C0 2.2 2.2 0 5 0C7.8 0 10 2.2 10 5C10 7.5 5 14 5 14Z"
                stroke="rgba(126,200,227,0.6)" strokeWidth="0.8" fill="none" />
            </svg>
            <span className="text-subtle text-[10px] tracking-[0.12em] text-ink-light/30">
              留下你的雨滴
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessageDrop;
