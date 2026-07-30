import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../context/SoundContext';

const SoundToggle: React.FC = () => {
  const { isSoundEnabled, toggleSound } = useSound();

  return (
    <motion.button
      onClick={toggleSound}
      className={`fixed bottom-6 right-6 z-50 rounded-full flex items-center gap-2 shadow-soft transition-all duration-500 ${
        isSoundEnabled
          ? 'bg-sky-deep/15 backdrop-blur-md border border-sky-deep/25 px-4 py-2.5'
          : 'glass px-3 py-2.5'
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isSoundEnabled ? '关闭声音' : '开启声音'}
    >
      {isSoundEnabled ? (
        <motion.svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          key="sound-on"
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
        >
          <path
            d="M11 5L6 9H2V15H6L11 19V5Z"
            fill="rgba(91,155,213,0.8)"
            stroke="rgba(91,155,213,0.8)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <motion.path d="M15 9C16.5 10.5 16.5 13.5 15 15"
            stroke="rgba(91,155,213,0.6)" strokeWidth="1.5" strokeLinecap="round"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.path d="M18 6C21 9 21 15 18 18"
            stroke="rgba(91,155,213,0.4)" strokeWidth="1.5" strokeLinecap="round"
            animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </motion.svg>
      ) : (
        <motion.svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          key="sound-off"
        >
          <path
            d="M11 5L6 9H2V15H6L11 19V5Z"
            fill="rgba(107,125,142,0.4)"
            stroke="rgba(107,125,142,0.4)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M17 9L22 14M22 9L17 14"
            stroke="rgba(107,125,142,0.4)" strokeWidth="1.5" strokeLinecap="round"
          />
        </motion.svg>
      )}

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={isSoundEnabled ? 'on' : 'off'}
          className={`text-subtle text-[10px] tracking-[0.12em] whitespace-nowrap ${
            isSoundEnabled ? 'text-sky-deep/70' : 'text-ink-light/40'
          }`}
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -5 }}
          transition={{ duration: 0.2 }}
        >
          {isSoundEnabled ? '有声' : '无声'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default SoundToggle;
