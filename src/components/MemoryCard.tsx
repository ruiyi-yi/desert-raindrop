import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Memory } from '../types';

interface MemoryCardProps {
  memory: Memory;
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, isOpen, onClose }) => {
  const [showText, setShowText] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reset text reveal when card opens
  useEffect(() => {
    if (isOpen) {
      setShowText(false);
      setTextIndex(0);
      setLightboxOpen(false);
      const timer = setTimeout(() => setShowText(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, memory.id]);

  // Character-by-character text reveal
  useEffect(() => {
    if (!showText || textIndex >= memory.text.length) return;
    const timer = setTimeout(() => {
      setTextIndex(prev => Math.min(prev + 1, memory.text.length));
    }, 50);
    return () => clearTimeout(timer);
  }, [showText, textIndex, memory.text.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center px-4 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink-dark/15 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative glass-strong rounded-2xl md:rounded-3xl p-6 md:p-10 max-w-md w-full shadow-glass overflow-y-auto max-h-[85vh] z-10"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-ink-light/50 hover:text-ink-light transition-colors z-20"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Date */}
            <motion.p
              className="text-subtle text-[10px] tracking-[0.2em] text-ink-light/50 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {memory.date}
            </motion.p>

            {/* Title */}
            <motion.h2
              className="text-title text-xl md:text-2xl text-ink-dark mb-6"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {memory.title}
            </motion.h2>

            {/* Photo — click to enlarge */}
            {memory.image && (
              <motion.div
                className="mb-6 cursor-zoom-in"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                onClick={() => setLightboxOpen(true)}
              >
                <div className="film-photo overflow-hidden group relative">
                  <img
                    src={memory.image}
                    alt={memory.title}
                    className="w-full h-48 md:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle hint on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                    <span className="text-white/0 group-hover:text-white/70 text-subtle text-xs tracking-[0.15em] transition-all duration-300">
                      点击放大
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Text - character by character */}
            <motion.div
              className="text-diary text-sm md:text-base text-ink leading-[2.2]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {memory.text.slice(0, textIndex)}
              {textIndex < memory.text.length && (
                <span className="inline-block w-[1px] h-4 bg-ink-light/30 ml-[1px] animate-pulse-soft" />
              )}
            </motion.div>

            {/* Tags */}
            {memory.tags && memory.tags.length > 0 && (
              <motion.div
                className="flex gap-2 mt-6 flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {memory.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-subtle text-[10px] tracking-[0.1em] px-3 py-1 rounded-full glass-blue text-ink-light/60"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Photo Lightbox */}
          <AnimatePresence>
            {lightboxOpen && memory.image && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setLightboxOpen(false)}
              >
                {/* Dark backdrop */}
                <motion.div
                  className="absolute inset-0 bg-ink-dark/70 backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Enlarged photo */}
                <motion.div
                  className="relative z-10 max-w-3xl max-h-[90vh]"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={memory.image}
                    alt={memory.title}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  />

                  {/* Close hint */}
                  <p className="text-center text-white/40 text-subtle text-xs tracking-[0.15em] mt-4">
                    点击任意处关闭
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemoryCard;
